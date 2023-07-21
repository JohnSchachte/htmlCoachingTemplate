var PAGETITLE = null;
var SS_ID = "1ZG2DqMHKIgkQaUGpYgZwr-84AaQW5gocsQIv9rGagu0"; // change this for different backends
var SHEETNAME = null;
const STARTCOLUMN = "A";
const ENDCOLUMN = "O";
const BUTTONCOL = "Update"; // Name of the column for the aciton button
const BUTTONNAMES = "Update Case"; // Name of the button in the action column
const CustomFunction = (rowValues) => rowValues; // A custom function before display the edit modal
const TEAMNAMES = ["Process Improvement"]; // the team to restrict access too
// Logger.log("REMOVE COLUMN = %s",REMOVECOL);
const REMOVECOL = new Set([" ","","User","Date","Web Page Link"]); // the columns to remove
const SEARCHPANESCOLUMNS = ["Action Taken:","Timestamp","Agent's Name"]; // Columns to filter by
const NOT_EDITABLE_COLUMNS = new Set(['Request Id','Timestamp',"Agent's Name",'Supervisor','Email Address','Coaching Identifier?','Ticket Link','Severity?','Category?','Describe?','Relevant_Files?']); // Columns that cannot be editted by user. Protect your data!
const DropDowns = {"Action Taken:" : ["Completed", "Request Calibration", "Needs Attention", "Waiting", "No action needed", "SOP Review"]}; //An object of Header names to the drop you want for them in the modal



function getNavigationDropDown(){
  const NavigationTest =  /[A-ZČŪĖ]+,\s?[A-ZČŪĖ]+/; // a test to filter in sheets you navigation to by your user. example I want my users to go any where there is WFM name pattern.
  return SpreadsheetApp.openById(SS_ID).getSheets().filter(sheet => NavigationTest.test(sheet.getName())).map(sheet => sheet.getName());
}

function getData(sheetName){
  const userEmail = Session.getActiveUser().getEmail(); // User's email address.
  
  // checks if user is part of team that is allowed to use this process.
  checkRestrictions(userEmail);
  
  const values = getValues(sheetName);
  
  if (SEARCHPANESCOLUMNS) {
    return JSON.stringify({values: values, searchPanesColumns: SEARCHPANESCOLUMNS});
  } else {
    return JSON.stringify({values: values});
  }
}

function actionExecution(rowIndex,sheetName) {
    const dataRange = `${sheetName}!${STARTCOLUMN}:${ENDCOLUMN}`;  
    const range = Sheets.Spreadsheets.Values.get(SS_ID, dataRange);
    const values = range.values;
    
    if (rowIndex < 0 || rowIndex >= values.length) {
      throw new Error(`Row index ${rowIndex} out of range`);
    }

    const scriptCache = CacheService.getScriptCache();
    const activeUserEmail = Session.getActiveUser().getEmail();

    checkPropertyValue(rowIndex,activeUserEmail,scriptCache);

    const rowValues = values[rowIndex];
    const labels = values[0];
    const rowData = labels.map((label, index) => {
      const obj =  {
          label: label,
          value: rowValues[index],
          editable : NOT_EDITABLE_COLUMNS.has(label) ? false : true,
          dropDown : DropDowns[label],
          seen : !REMOVECOL.has(label)
        }
        return obj;
    });
    // Logger.log(rowData);

    setPropertyValue(rowIndex,activeUserEmail,scriptCache);

    // Custom function implementation goes here...
    CustomFunction(rowValues);
    return rowData;
}

function doGet(e) {
  //get sheet name
  const sheetName = e.parameter.sheet;
  if (sheetName === undefined) {
    throw new Error("No sheet parameter provided");
  }
  // Get HTML Template with Shift4 favicon 
  const template = HtmlService.createTemplateFromFile("HTMLTable");
  template.title = sheetName;
  template.buttons = BUTTONNAMES;
  template.butcol = BUTTONCOL;
  return template
    .evaluate()
    .setFaviconUrl("https://www.shift4.com/images/SHIFT4-Icon_100x100.png")
    .setTitle(sheetName)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, height=device-height, initial-scale=1, user-scalable=no;user-scalable=0;");
}

function  updateRow(rowIndex, rowData,sheetName) {
    let dataRange = `${sheetName}!${STARTCOLUMN}${rowIndex + 1}:${ENDCOLUMN}${rowIndex + 1}`;  // Sheet and spreadsheet range for a specific row.
    let range = Custom_Utilities.exponentialBackoff(() => Sheets.Spreadsheets.Values.update(
        {
          range: dataRange,
          majorDimension: "ROWS",
          values: [rowData]  // Wrap rowData in an array to make it a 2D array.
        },
        SS_ID, dataRange, {
        valueInputOption: "USER_ENTERED"  // Or "RAW", depending on how you want to handle input data.
      })
    );
  
    // Get the cache.
    let cache = CacheService.getScriptCache();
  
    // Remove rowIndex from cache when done.
    cache.remove(rowIndex.toString());
}

function checkStatusChange(rowData){
  Logger.log(rowData);
  const templateMap = getColMap("Template");
  const requestId = rowData[templateMap.get("Request Id")];
  const range = `'Submissions'!${requestId}:${requestId}`;
  Logger.log(range);
  const submissionRow = Custom_Utilities.exponentialBackoff(() => SpreadsheetApp.openById(BACKEND_ID).getRange(range).getValues())[0];

  const submissionMap = getColMap("Submissions");
  if(rowData[templateMap.get("Action Taken:")] != submissionRow[submissionMap.get("Status")]){
    Logger.log("updating row = %s",requestId);
    updateStatusChange(submissionRow,submissionMap,rowData,templateMap,range);
  } 
}

function finishEditing(rowIndex){
    // Get the cache.
  const cache = CacheService.getScriptCache();

  // Remove rowIndex from cache when done.
  cache.remove(rowIndex.toString());
}

function include(filename) {
      return HtmlService.createHtmlOutputFromFile(filename)
          .getContent();
  };