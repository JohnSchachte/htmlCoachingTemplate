function generateFormReliability(row){
    const readFromCache = Custom_Utilities.getMemoizedReads(CacheService.getScriptCache());
    const colMap = Custom_Utilities.mkColMap(readFromCache(SS_ID,"Template!1:1").values[0]);
    const CALIBRATION_FORM_ID = "1zgq4BD5kWd0Z4gAZ1NxHHMWaqvpV3ezfaNV7gzU40Vc";

    const form = Custom_Utilities.exponentialBackoff(() => FormApp.openById(CALIBRATION_FORM_ID));
  
    const formResponseMap = {
      "Request Id":"2143050250",
      "Coaching Identifier?" : "1186810156",
      "Ticket Link":"2063590594",
      "Agent's Name" : "1924489668",
      "Describe?" : {
        "1565594362" : /Reliability Agent:\s+([^\r\n]+)/,
        "1092946203" : /Evaluation Date:\s+([^\r\n]+)/
      }
    }

    // let regex = /Scoring Dispute|Issue with Documentation/;
    Logger.log(row[colMap.get("Category?")])
    Logger.log(row[colMap.get("Category?")].startsWith("Evaluation Dispute"))
    if(!row[colMap.get("Category?")].startsWith("Evaluation Dispute")){
      delete formResponseMap["Coaching Identifier?"];
    }

    const formResponse = form.createResponse();
    Object.entries(formResponseMap).forEach(pair => {
      if(pair[0] === "Describe?"){
        Object.entries(pair[1]).forEach(searchPair => {
          let match = row[colMap.get(pair[0])].match(searchPair[1]);
          match ? formResponse.withItemResponse(form.getItemById(searchPair[0]).asTextItem().createResponse(match[1])) : false;
        });
      }else{
        formResponse.withItemResponse(form.getItemById(pair[1]).asTextItem().createResponse(pair[0] === "Request Id" ? "test".concat(row[colMap.get(pair[0])]) : row[colMap.get(pair[0])]))    
      }
    });
    return formResponse.toPrefilledUrl();
  }

function sendSOPRequest(row,document,change){
  const colMap = getColMap("Template");
  const body = formatResponse(row,colMap,document,change);
  GmailApp.sendEmail(
    PropertiesService.getScriptProperties().getProperty("opsAdminEmail"),
    "Documentation Calibration Request" + " test"+row[colMap.get("Request Id")],
    body
  );

}

function formatResponse(row,colMap,document,change){
  return `
  requestor : ${row[colMap.get("Supervisor")]}
  Agent's name: ${row[colMap.get("Agent's Name")]}
  Ticket Info : ${row[colMap.get("Ticket Link")]}
  Document to Change : ${document}
  Part To Change in Documentation: ${change}
  ${row[colMap.get("Coaching Identifier?")] ? "Record Id: "+row[colMap.get("Coaching Identifier?")] : ""}
  Relevant Files: ${row[colMap.get("Relevant_Files?")]}
  Description : ${row[colMap.get("Describe?")]}`;
}