define([], function() {
  var self = this;

  self.loadData = function(view, $element, layout) {
    var hc = layout.qHyperCube;
    var totalRows = hc.qSize.qcy;

    var loadedRows = 0;
    for (var p = 0; p < hc.qDataPages.length; p++) {
      loadedRows += hc.qDataPages[p].qMatrix.length;
    }

    if (totalRows > loadedRows) {
      $element.html('');
      $element.append('<h1>Loading data...</h1>');
      // Loading animation
      // $element.append($('<div/>').attr({"class": "qv-loader"}).css({"height": "90px", "width": "90px", "margin-top": "10px"}));

      var width = hc.qSize.qcx;
      var height = Math.floor(5000 / width);
      var numPages = Math.ceil((totalRows - loadedRows) / height);

      var top = loadedRows;
      var pageDefs = [];
      for (var i = 0; i < numPages; i++) {
        if (numPages - 1 === i)
          height = totalRows - top;

        pageDefs.push({
          qTop: top,
          qLeft: 0,
          qWidth: width,
          qHeight: height
        });
        top += height;
      }

      var backendApi = view.backendApi;
      return pageDefs.reduce(function(prev, curr) {
        // Return a new promise
        return new Promise(function(resolve, reject) {
          // When the previous promise is done
          prev.then(function(accPages) {
            // Get the new page
            backendApi.getData([curr]).then(function(newPage) {
              // Add the latest page to the accumulated array of pages and resolve the promise with that accumulated array
              accPages.push(newPage);
              resolve(accPages);
            })
          })
        });

      }, Promise.resolve([]));
    }

    return Promise.resolve([]);
  };

  self.prepareData = function(view, layout, options) {
    var result = {data: [], dimensions: [], fieldNames: {}};
    var hc = layout.qHyperCube;
    var fieldKeys = [];
    var i;
    var tokens;
    
    if (options.tokens) {
      tokens = JSON.parse(options.tokens);
    } else {
      tokens = {
        dimCount: 0,
        measCount: 0
      };
    }
    
    for (i = 0; i < hc.qDimensionInfo.length; i++) {
      var dimestionId = tokens[hc.qDimensionInfo[i].cId];
      if (!dimestionId){
        dimestionId = tokens[hc.qDimensionInfo[i].cId] = "dimension" + tokens.dimCount;
        tokens.dimCount++;
      }

      fieldKeys.push(dimestionId);
      result.dimensions.push({'number': i, 'id': dimestionId, 'indexes': []});
      result.fieldNames[dimestionId] = hc.qDimensionInfo[i]['qFallbackTitle'];
    }

    for (i = 0; i < hc.qMeasureInfo.length; i++) {
      var measureId = tokens[hc.qMeasureInfo[i].cId];
      if (!measureId){
        measureId = tokens[hc.qMeasureInfo[i].cId] = "measure" + tokens.measCount;
        tokens.measCount++;
      }

      fieldKeys.push(measureId);
      result.fieldNames[measureId] = hc.qMeasureInfo[i]['qFallbackTitle'];
    }

    result.tokens = tokens;

    for (var p = 0; p < hc.qDataPages.length; p++) {
      for (var m = 0; m < hc.qDataPages[p].qMatrix.length; m++) {
        var row = hc.qDataPages[p].qMatrix[m];
        var processedRow = {};
        var groupedDimValue = '';

        for (var j = 0; j < row.length; j++) {
          var value;
          if (row[j]['qState'] === 'O' || row[j]['qState'] === 'S' || row[j]['qIsOtherCell']) {
            // dimension
            value = row[j]['qText'];
            groupedDimValue = groupedDimValue ? groupedDimValue + '_' + value : value;

            result.dimensions[j]['indexes'].push(row[j]["qElemNumber"]);

          } else {
            // measure
            value = row[j]['qIsNull'] ?
                null :
                row[j]['qNum'] === 'NaN' ? row[j]['qText'] : row[j]['qNum'];
          }

          processedRow[fieldKeys[j]] = value;
        }

        if (result.dimensions.length > 1) {
          // Grouped dimensions field
          processedRow['dimensionGroup'] = groupedDimValue;
        }

        result.data.push(processedRow);
      }
    }

    return result;
  };

  return self;
});