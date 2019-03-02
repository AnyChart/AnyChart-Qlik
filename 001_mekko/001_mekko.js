requirejs.config({
  config: {
    'plugin': {
      type: 'mekko'
    }
  },
  paths: {'plugin': 'http://127.0.0.1:8080/anychart-qlik'}
});

define(['plugin'],function(plugin){
  return plugin;
});