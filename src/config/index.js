const parseBoolean = (variable, defaultValue) => {
  if (variable === undefined) {
    return defaultValue;
  }

  const variableLowerCase = variable.toLowerCase();
  if (variableLowerCase === 'true') {
    return true;
  }

  if (variableLowerCase === 'false') {
    return false;
  }

  return !!parseInt(variable, 10);
};

const parseNumber = (variable, defaultValue) => (variable !== undefined ? parseInt(variable, 10) : defaultValue);

const parseString = (variable, defaultValue) => (variable !== undefined ? variable : defaultValue);

module.exports = {
  parseBoolean,
  parseNumber,
  parseString,
};
