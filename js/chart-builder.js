define(["./../credits", "./../js/data-adapter"],
    function(credits, dataAdapter) {
      return function() {

        var _static = {
          /**
           * 'chartId' : {'chart': Object, 'selected': integer[]}
           */
        };

        this.updateSelections = function(id) {
          for (var s = 0; s < _static[id]['chart']['getSeriesCount'](); s++) {
            _static[id]['chart']['getSeriesAt'](s)['select'](_static[id]['selected']);
          }
        };

        this.buildChart = function(view, layout) {
          var code = layout.anychart.code;
          if (!code) return null;

          var self = this;
          var id = layout.qInfo.qId;
          var chart;

          if (!_static[id]) _static[id] = {chart: null};

          _static[id].selected = [];

          if (_static[id]['chart'] && typeof _static[id]['chart']['dispose'] == 'function') {
            anychart['utils']['hideTooltips']();
            _static[id]['chart'].dispose();
          }

          var codeSplit = code.split('var rawData=[/*Add your data here*/];'); // todo: do better
          if (codeSplit.length == 2) {

            // Chart creation code
            var code1 = '(function(){' + codeSplit[0] + 'return chart;})();';

            // Data apply and chart settings code
            var code2 = '(function(){ return function(chart, rawData){' + codeSplit[1] + '}})();';

            // Create chart instance
            chart = _static[id]['chart'] = eval(code1);

            if (!chart) return null;

            // Apply global settings
            chart['contextMenu'](false);

            if (credits.licenseKey && typeof credits.licenseKey === 'string') {
              anychart['licenseKey'](credits.licenseKey);

              var chartCredits = chart['credits']();
              if (typeof credits.enabled === 'boolean')
                chartCredits['enabled'](credits.enabled);

              if (typeof credits.text === 'string')
                chartCredits['text'](credits.text);

              if (typeof credits.url === 'string')
                chartCredits['url'](credits.url);

              if (typeof credits.logoSrc === 'string')
                chartCredits['logoSrc'](credits.logoSrc);
            }

            // Apply editor's settings
            var code2func = eval(code2);

            var data = dataAdapter.prepareData(view, layout);
            code2func.apply(null, [chart, data]);

          } else
            return null;

          // Selections processing
          // var isSeriesBased = typeof chart['getSeriesCount'] == 'function';
          // var chartType = chart['getType']();
          //
          // chart['interactivity']()['selectionMode']('none');
          //
          // var pointClicked = false;
          // chart['listen']("mouseDown", function() {
          //   if (!pointClicked) {
          //     chart['dispatchEvent']("pointMouseDown");
          //   }
          //   pointClicked = false;
          // });
          //
          // var dimIndexes = [];
          // chart['listen']("pointMouseDown", function(evt) {
          //   if (evt.pointIndex != undefined) {
          //     pointClicked = true;
          //
          //     view.selectValues(0, [dimIndexes[evt.pointIndex]], true);
          //
          //     var index = _static[id]['selected'].indexOf(evt.pointIndex);
          //     if (index == -1) {
          //       _static[id]['selected'].push(evt.pointIndex);
          //     } else {
          //       _static[id]['selected'].splice(index, 1);
          //     }
          //   }
          //
          //   if (isSeriesBased)
          //     self.updateSelections(id);
          // });
          //
          // view.clearSelectedValues = function() {
          //   _static[id]['selected'] = [];
          //   if (isSeriesBased)
          //     self.updateSelections(id);
          //
          //   else {
          //     switch (chartType) {
          //       case 'pie':
          //         chart['explodeSlices'](false);
          //         break;
          //       default:
          //         console.log("Process me!", chartType);
          //         break;
          //     }
          //   }
          // };

          // debug
          //window['chart'] = chart;

          return chart;
        };
      };
    });