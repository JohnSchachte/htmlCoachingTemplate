let urlToAnchor = value => {
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      return `<a href="${value}">${value}</a>`;
    } else {
      return value;
    }
};

let generatePrefilledLink = (value) => {
    if (value === "Request Calibration") {
      // Replace the value with a button that has a unique class and data attribute
      return `<button class="calibration-button btn btn-primary btn-sm">Request Calibration</button>`;
    } else {
      return value;
    }
  };

const sopTransformation = (value) => {
    if(value === "SOP Review"){
        return `<button class="sop-button btn btn-primary btn-sm">SOP Review</button>`;
    }else{
        return value;
    }
};
  
  