'use strict';

const path                  = require('path');
const fs                    = require('fs');
const YAML                  = require('yamljs');

const translatableKeys = [
  /description/,
  /metadata\.longDescription/,
  /metadata\.configurationSteps\.[0-9]+\.title/,
  /metadata\.configurationSteps\.[0-9]+\.instructions/,
  /metadata\.configurationSteps\.[0-9]+\.description/,
  /metadata\.configurationSteps\.[0-9]+\.fileDescription/,
  /metadata\.configurationSteps\.[0-9]+\.nextSteps/
];

function flatten(obj, prefix = '', flatObj = {}) {
  Object.keys(obj).forEach(key => {
    const thisElem = obj[key];
    const fullKey = prefix ? prefix + '.' + key : key;

    if (typeof thisElem === 'object') {
      flatten(thisElem, fullKey, flatObj);
    } else {
      flatObj[fullKey] = thisElem;
    }
  });

  return flatObj;
}

function exportStrings() {
  const strings = {};
  const catalog = YAML.load(path.join(__dirname, './eventSourceCatalog.yaml'));
  catalog.forEach(catalogEntry => {
    const flatEntry = flatten(catalogEntry.integration_catalog);

    Object.keys(flatEntry).forEach(key => {
      if (translatableKeys.some(tKey => tKey.test(key))) {
        if (flatEntry[key]) {
          strings[catalogEntry.id + '.' + key] = flatEntry[key];
        }
      }
    });
  });

  return strings;
}

function processString(key, value, locale, target) {
  let keyPath = key.split('.');
  const integrationId = keyPath[0];
  keyPath = keyPath.slice(1);

  if (!target[integrationId]) {
    target[integrationId] = {};
  }

  if (!target[integrationId][locale]) {
    target[integrationId][locale] = {};
  }

  let current = target[integrationId][locale];
  keyPath.forEach((keySegment, i) => {
    const isLast = i === keyPath.length - 1;
    const hasValue = !!current[keySegment];
    const keyId = isNaN(keySegment) ? keySegment : Number(keySegment);

    if (!hasValue) {
      current[keyId] = isLast ? value : {};
    }

    current = current[keyId];
  });
}

function getNls() {
  const nlsDir = path.join(__dirname, 'nls');
  const nlsData = {};
  fs.readdirSync(nlsDir).forEach(file => {
    if (file) {
      const localeMatch = /^messages_([a-zA-Z-_]+).json$/.exec(file);

      if (localeMatch && localeMatch[1]) {
        const localeStrings = require(path.join(nlsDir, file));

        Object.keys(localeStrings).forEach(key => {
          processString(key, localeStrings[key], localeMatch[1], nlsData);
        });
      }
    }
  });

  return nlsData;
}

function getEventSourceList() {
  const nls = getNls();
  const catalog = YAML.load(path.join(__dirname, './eventSourceCatalog.yaml'));

  Object.keys(nls).forEach(serviceId => {
    catalog
      .find(x => x.id === serviceId)
      .integration_catalog.metadata.i18n = nls[serviceId];
  });

  return catalog;
}

function getCatalog(eventSourceList) {
  return {
    services: eventSourceList.map(es => es.integration_catalog)
  };
}

const eventSources = getEventSourceList();

module.exports = {
  exportStrings,
  eventSources,
  catalog: getCatalog(eventSources)
};
