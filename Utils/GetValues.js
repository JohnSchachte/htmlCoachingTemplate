// helper function for modularized code

function  getValues(sheetName){
    let values;
    if (REMOVECOL) {
      values = Custom_Utilities.exponentialBackoff(() =>Sheets.Spreadsheets.Values.get(SS_ID, `${sheetName}!${STARTCOLUMN}:${ENDCOLUMN}`,{majorDimension:"COLUMNS"})).values; // Get the values from spreadsheet in SS_ID
      values = values.filter(row => {
        return !REMOVECOL.has(row[0]);
      });
      values = transposeTransform(values,[urlToAnchor,generatePrefilledLink,sopTransformation]);
    }else{
      values = SpreadsheetApp.openById(SS_ID).getRange(`'${sheetName}'!${STARTCOLUMN}:${ENDCOLUMN}`).getValues();
    }
    return values;
  }
