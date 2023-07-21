function checkPropertyValue(rowIndex,activeUserEmail,cache){
  // Check if rowIndex already exists in script cache.
  const propertyValueString = cache.get(rowIndex.toString());
  const propertyValue = propertyValueString ? JSON.parse(propertyValueString) : false;
  if (propertyValue && propertyValue.email !== activeUserEmail) {
      throw new Error(`Row is currently being edited by another user, please try again later.`);
  }
}

function setPropertyValue(rowIndex,activeUserEmail,cache){
    const currentDateTimeString = new Date().toISOString();
    const propertyValue = JSON.stringify({
      dateTime: currentDateTimeString,
      email: activeUserEmail
    });

    cache.put(rowIndex.toString(), propertyValue, 1800);
}