function mkElapsedTime (submittedTime){
  var now = new Date();
  // Logger.log("Now is " + now);
  Logger.log("submittedTime is " + submittedTime);
  var elapsed = now.getTime() - submittedTime.getTime();
  // Logger.log("Elapsed Time = " + elapsed);
  // elapsed is in milliseconds => convert to seconds
  elapsed = Math.round(elapsed / 1000);
  // produces a string of hh:mm:ss idk what to do about days
  elapsedString = convertSecToDuration(elapsed)
  
  return elapsedString;
}

function convertSecToDuration(secs){
  // var days = Math.floor(secs / (3600 * 24))
  // secs = Math.round(secs - days * 24 * 3600)
  var hours = Math.floor(secs / 3600);
  secs = Math.round(secs - hours * 3600);
  var minutes = Math.floor(secs / 60);
  // Logger.log((minutes * 60))
  var secs = Math.round(secs - minutes * 60);
  // Logger.log("seconds are " + secs);
  if(secs < 10){
    secs = "0" + secs;
  }
  if(hours < 10){
    hours = "0" + hours;
  }
  if(minutes < 10){
    minutes = "0" + minutes;
  }
  // if(days < 1){
  //   return hours + ":"+ minutes + ":" + secs;
  // }
  // Logger.log(days + " " + hours + ":"+ minutes + ":" + secs)
  return hours + ":"+ minutes + ":" + secs;
}

function getColMap(sheetName){
    const readFromCache = Custom_Utilities.getMemoizedReads(CacheService.getScriptCache());
    const colMap = Custom_Utilities.mkColMap(readFromCache("1ZG2DqMHKIgkQaUGpYgZwr-84AaQW5gocsQIv9rGagu0",`${sheetName}!1:1`).values[0]);
    return colMap;
}

function getColumnRanges(headers,sheets,colMap,startRange="",endRange=""){
    const ranges = [];
    sheets.forEach(sheet => {
      let sheetBase = sheet + "!";
      headers.forEach(header => {
        let letter = columnToLetter(colMap.get(header)+1)
        ranges.push(sheetBase.concat(letter,startRange,":",letter,endRange))
      })
    })
    return ranges;
  }

function transposeWithNulls(matrix) {
  // Logger.log("we're in transpose with nulls")

  // Get the length of the longest row
  let length = matrix.length;
  // Logger.log(length);

  // Initialize an empty array for the transposed matrix
  let transposedMatrix = Array.from({ length }, () => []);

  matrix.forEach((row, rowIndex) => {
    for (let i = 0; i < length; i++) {
      // If the current row doesn't have a value at the current index, use null
      let value = row[i] !== undefined ? row[i] : null;

      // Add the value to the corresponding row in the transposed matrix
      transposedMatrix[i][rowIndex] = value;
    }
  });
  // Logger.log(transposedMatrix);
  return transposedMatrix;
}



function transposeTransform(matrix, transformations = []) {
  Logger.log(matrix);
  // size of all the rows
  let length = 0;
  matrix.forEach(el => length+=1);
  return matrix[0].map((_, c) => {
    const newRow = new Array(length).fill(null);
    for (let r = 0; r < length; r++) {
      // If the current row doesn't have a value at the current index, use null
      let value = matrix[r][c] !== undefined ? matrix[r][c] : "";

      // Apply each transformation function to the value
      transformations.forEach(transform => {
        value = transform(value);
      });

      // Add the value to the corresponding row in the transposed matrix
      newRow[r] = value;
    }
    return newRow;
  });
}


