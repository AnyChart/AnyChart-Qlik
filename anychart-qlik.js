define([
      "jquery",
      "./js/properties",
      "./config",

      "qlik",
      './js/data-adapter',
      "./js/chart-builder",
      "./js/chart-editor",
      "./lib/proj4",

      "./lib/themes-combined",
      "./lib/anychart-bundle.min",
      "./lib/anychart-editor.min",

      "css!./lib/anychart-ui.min.css",
      "css!./lib/anychart-editor.min.css",
      "css!./lib/anychart-font.min.css",
      "css!./style.css"
    ],
    function($, pDef, config, qlik, dataAdapter, chartBuilder, chartEditor, proj4) {
      'use strict';
      window['proj4'] = proj4;

      var builder = new chartBuilder();
      var editor = new chartEditor();
      var hCubeWidth = config.settings.maxDimensions + config.settings.maxMeasures;
      var hCubeHeight = Math.floor(10000 / Math.min(10000, hCubeWidth));
      var documentURI = null;

      //remove default Qlik font-family for SVG objects
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        for (var j = 0; j < sheet.cssRules.length; j++) {
          var rule = sheet.cssRules[j];
          if (rule.style && rule.selectorText == ".qv-object *") {
            rule.style.removeProperty("font-family");
          }
        }
      }

      return {
        initialProperties: {
          version: 1.0,
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [{
              qWidth: hCubeWidth,
              qHeight: hCubeHeight
            }]
          },
          selectionMode: "CONFIRM"
        },

        //property panel
        definition: pDef,

        support: {
          snapshot: true,
          export: true,
          exportData: true
        },

        paint: function($element, layout) {
          var view = this;
          var inputLocale = typeof config.localization.inputLocale === 'string' && config.localization.inputLocale;
          var outputLocale = typeof config.localization.outputLocale === 'string' && config.localization.outputLocale;

          if (inputLocale && !anychart['format']['locales'][inputLocale] ||
              outputLocale && !anychart['format']['locales'][outputLocale]) {
            // Loading locales
            var localeUrl;
            if (inputLocale && !anychart['format']['locales'][inputLocale]) {
              localeUrl = '//cdn.anychart.com/releases/v8/locales/' + inputLocale + '.js';
              require([localeUrl], function() {
                view.paint($element, layout);
              });
              return qlik.Promise.resolve();

            } else if (outputLocale && !anychart['format']['locales'][outputLocale]) {
              localeUrl = '//cdn.anychart.com/releases/v8/locales/' + outputLocale + '.js';
              require([localeUrl], function() {
                view.paint($element, layout);
              });
              return qlik.Promise.resolve();
            }
          }

          dataAdapter.loadData(view, $element, layout).then(function() {
            $element.html('');

            if (documentURI !== document.documentURI) {
              anychart['graphics']['updateReferences']();
              documentURI = document.documentURI;
            }

            // Applying globals
            if (config.credits.licenseKey && typeof config.credits.licenseKey === 'string') {
              anychart['licenseKey'](config.credits.licenseKey);
            }

            if (config.defaultTheme && typeof config.defaultTheme === 'string') {
              anychart['theme'](config.defaultTheme);
            }

            for (var l in config.localization) {
              if (typeof anychart['format'][l] === 'function') {
                anychart['format'][l](String(config.localization[l]));
              }
            }

            var options = layout.anychart;

            if (layout.anychart.chartEditor === "true" && view.options.interactionState === 2) {
              editor.openEditor(view, layout, options);

            } else {
              var chart = builder.buildChart(view, layout, options);

              if (chart) {
                var containerId = "container_" + layout.qInfo.qId;
                $element.append(
                    $('<div/>')
                        .attr({"id": containerId, "class": "chart-container"})
                        .css({"width": "100%", "height": "100%"}));

                chart['container'](containerId);
                chart['draw']();
              } else {
                var str = '<div class="intro-wrapper"><div class="intro">' +
                    '<h1>Thank you for using AnyChart Qlik Sense Extension!</h1>' +
                    'Now you can start configuring your chart.<br><br>' +
                    'To run Chart Editor, please click on "Run Chart Editor" button in the Appearance Tab:' +
                    '<div class="screenshot screenshot-1"></div><br>' +
                    'Also you can use multiple measures and dimensions. Please use "Dimensions", "Measures" and "Sorting" tabs to setup your data:' +
                    '<div class="screenshot screenshot-2"></div></div></div>';

                $element.html(str);
              }
            }
          });

          return qlik.Promise.resolve();
        },

        resize: function($element, layout) {}
      };
    });

