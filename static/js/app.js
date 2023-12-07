/*
/////////////////////////////////////////////////////////////////////////////////////////////////
////////////// [D3 JavaScript] Belly Button Biodiversity Interactive Dashboard /////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
*/

// NOTE #1: When this JS solution is loaded through its corresponding HTML file, A Content Delivery Network (CDN) is also included in the HTML to load the D3.js library
// NOTE #2: When this JS solution is loaded through its corresponding HTML file, A Content Delivery Network (CDN) is also included in the HTML to load the Plotly library
// NOTE #3: Debugging was done through a web browser e.g. Google Chrome / Microsoft Edge

/*
//////////////////////////////////////////////////////////////////
////////////// Fetch JSON Sample Dataset from URL ///////////////
////////////////////////////////////////////////////////////////
*/

// Define variable to store the fetched JSON Dataset; used beyond Step #1
let myData;

// Get URL (Belly Button Biodiversity endpoint i.e. JSON Dataset) as Constant; not going to be altered
myURL = 'https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json';

// Using D3, fetch the Belly Button Biodiversity (JSON) Dataset from the specified URL 
// Once successful, THEN pass through the loaded JSON dataset as an argument to the following callback function where...
d3.json(myURL).then(jsonData => {
  // The loaded JSON Dataset is stored in the nominated variable
  myData = jsonData;

  // The dropdown menu (<select> HTML element from the HTML file) with ID 'selDataset' is referenced and stored in a new Constant
  // Relevant for Part #2 and onward...
  const dropdownMenu = d3.select("#selDataset");

  // The array of all name ID elements from the 'names' key of the JSON dataset is stored in a new Constant
  // Used to define the full list of invidivual name IDs in the dropdown menu
  const nameIDs = myData.names;

  // For every nameID element in the array of NameIDs...
  // Append the list of options in the dropdown menu with the current nameID element where...
    // The display text of the appended option is the current nameID element
    // The value property of the appended option is also the current nameID element
  nameIDs.forEach(nameID => {
    dropdownMenu.append("option").text(nameID).property("value", nameID);
  });
  
  // Initialise all plots & display using the first (default) nameID element from the array
  // By default, the dropdown menu will also have the first nameID element selected
  init_AllPlots(nameIDs[0], myData)
});


/*
////////////////////////////////////////////////////////////////////////////////////////////
///////////// All Plots Simultaneously Updated when New Sample is Selected ////////////////
//////////////////////////////////////////////////////////////////////////////////////////
*/

// Function expression that is called whenever a new option (nameID) has been selected from the dropdown menu by the user
// This is called only through the 'onchange' event from the <select> HTML element
// [Reference] From the onchange event, the function is called like so: 'optionChanged(this.value)'
// this.value = the current option selected in the dropdown menu after the change was made
const optionChanged = (thisValue) => {
  // All plots in the interactive board are re-initialised when a new subject ID from the dropdown list is selected
  init_AllPlots(thisValue, myData);
};
  
// Function expression that initialises / re-initialises all data plots on display in the interactive board
// This is called when:
// After the the JSON dataset is fetched
 // A new option is selected from the dropdown menu
const init_AllPlots = (thisValue, thisDataset) => {
  // Return the first sample (nested object) element where its id value matches the currently selected option (Test Subject ID) value from the dropdown menu
  // Using the 'find' array method, go through every sample until a match is found
  const currentSample = thisDataset.samples.find(sample => sample.id === thisValue);

  // Return the first metadata (nested object) element where its id value matches the currently selected option (Test Subject ID) value from the dropdown menu
  // Using the 'find' array method, go through every metadata nested object until a match is found
  // Use '+' operator to convert the current nameID value to a number; otherwise this will return null.
  const currentMetadata = thisDataset.metadata.find(metadata => metadata.id === +thisValue);

  // Initialise or Reinitialise the Display of Metadata Info i.e. Demographic Info
  // The extracted metadata object is passed through
  init_demoInfo(currentMetadata);
  
  // Initialise or Reinitialise the Bar Chart (Sample Values vs. OTU IDs)
  // Current nameID value and extracted sample object are passed through
  init_BarChart(thisValue, currentSample);

  // Initialise or Reinitialise the Bubble Chart (OTU IDs vs. Sample Values)
  // Current nameID value and extracted sample object are passed through
  init_BubbleChart(thisValue, currentSample);
};


/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Create Horizontal Bar chart w/ Dropdown Menu Displaying the Top 10 OTUs from Selected Sample //////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
*/

// Function expression to initialise or reinitialise the Bar Chart for the Top 10 OTUs from the selected Test Subject ID (nameID)
// Requires the current nameID element and sample object
// Called only through the init_AllPlots function
const init_BarChart = (thisValue, currentSample) => {
  // Using the slice method, get a new array containing the first 10 elements from the 'sample_values' array in the sample object
  // After, the reverse method is used to flip the order of elements in the new array before it is returned
  // In the original 'sample_values' array, the values are already in descending order
  const top_otuSVs = currentSample.sample_values.slice(0, 10).reverse();

  // Using the slice method, get a new array containing the first 10 elements from the 'otu_ids' array in the sample object
  // After, the reverse method is used to flip the order of elements in the new array before it is returned
  // This is done to match each otu_id with its corresponding sample_value (from top_otuSVs)
  const top_otuIDs = currentSample.otu_ids.slice(0, 10).map(otu_id => `OTU #${otu_id}`).reverse();

  // Using the slice method, get a new array containing the first 10 elements from the 'otu_labels' array in the sample object
  // After, the reverse method is used to flip the order of elements in the new array before it is returned
  // This is done to match the order of the above arrays
  const top_otuLabels = currentSample.otu_labels.slice(0, 10).reverse();

  // Define the Bar Chart trace object
  const traceBar = {
    x: top_otuSVs,          // x axis = Sample Values
    y: top_otuIDs,          // y axis = OTU IDs
    text: top_otuLabels,    // text annotation (when hovering over any bar) = OTU Labels
    type: 'bar',            // plot type = bar
    orientation: 'h'        // orientation = horizontal
  };

  // Define the Bar Chart layout object
  const layoutBar = {
    title: `Top 10 OTUs - Test Subject ID #${thisValue}`, // plot heading
    xaxis: {title: 'Sample Values'}                       // x axis label
  };
  
  // Using Plotly Library
  // From the <div> HTML element (id = "bar"), generate a new bar plot using the trace and layout objects
  Plotly.newPlot("bar", [traceBar], layoutBar);

};


/*
//////////////////////////////////////////////////////////////////////////
///////////// Create Bubble Chart Displaying Each Sample ////////////////
////////////////////////////////////////////////////////////////////////
*/

// Function expression to initialise or reinitialise the Bubble Chart displaying each OTU ID from the selected Test Subject ID (nameID)
// Requires the current nameID element and sample object
// Called only through the init_AllPlots function
const init_BubbleChart = (thisValue, currentSample) => {
  // Define the Bubble Chart trace object
  const traceBubble = {
    x: currentSample.otu_ids,             // x axis = OTU IDs
    y: currentSample.sample_values,       // y axis = Sample Values
    text: currentSample.otu_labels,       // text annotation (when hovering over any bar) = OTU Labels
    mode: 'markers',                      // display datapoints as markers
    marker: {
      size: currentSample.sample_values,  // dynamically adjust marker size based on Sample Value
      color: currentSample.otu_ids,       // colour each marker (OTU ID)
      colorscale: 'Portland',             // use the Portland colour scaling
      showscale: true,                    // show the colour scale next to the plot
    },
  };

  // Define the Bubble Chart layout object
  const layoutBubble = {
    title: `Bubble Chart - Test Subject ID #${thisValue}`,    // plot heading
    xaxis: { title: 'OTU IDs' },                              // x axis label
    yaxis: { title: 'Sample Values' },                        // y axis label
    height: 600,                                              // height of plot display
    width: 1300                                               // width of plot display
  };
  
  // Using Plotly Library
  // From the <div> HTML element (id = "bubble"), generate a new bubble chart using the trace and layout objects
  Plotly.newPlot("bubble", [traceBubble], layoutBubble);

};


/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////// Display Sample Metadata (Demographic Information) w/ Key-Value Pairs ///////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
*/

// Function expression to initialise or reinitialise the Demographic Info (Metadata Sample) displaying each OTU ID from the selected Test Subject ID (nameID)
// Requires the current metadata sample object
// Called only through the init_AllPlots function
const init_demoInfo = (currentMetadata) => {
  
  // The panel body (<div> HTML element) with ID 'sample-metadata' is selected
  const demoPanel = d3.select("#sample-metadata");

  // Using the html method, clear all text from the panel body
  demoPanel.html("");

  // The Object.entries() method returns an array of [key, value] pairs
  // For every [key, value], append the panel body with the key and value from the current pair as text
  Object.entries(currentMetadata).forEach(([key, value]) => {
    demoPanel.append("p").text(`${key}: ${value}`);
  });

}

