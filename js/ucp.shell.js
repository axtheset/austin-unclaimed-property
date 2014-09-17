/*
 * ucp.shell.js
 * Shell module for Unclaimed Property
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global $, ucp */

ucp.shell = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : String()
        + '<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">'
          + '<div class="container">'
            + '<div class="navbar-header">'
              + '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">'
                + '<span class="sr-only">Toggle navigation</span>'
                + '<span class="icon-bar"></span>'
                + '<span class="icon-bar"></span>'
                + '<span class="icon-bar"></span>'
              + '</button>'
              + '<a class="navbar-brand" href="index.html">Unclaimed Property Check</a>'
            + '</div>'
            + '<div class="navbar-collapse collapse">'
              + '<ul class="nav navbar-nav">'
                + '<li class="active"><a href="index.html">Home</a></li>'
                + '<li><a href="about.html">About</a></li>'
              + '</ul>'
            + '</div><!--/.nav-collapse -->'
          + '</div>'
        + '</div>'
        + '<div class="container theme-flatly" role="main">'
          + '<div class="ucp-search-form">'
          + '</div>'
        + '</div>'
    },
    stateMap = {
      $container  : undefined
    },
    jqueryMap = {},
    setJqueryMap,
    initModule;

  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = {
      $container  : $container,
      $searchForm : $container.find('.ucp-search-form'),
      //$nav       : $container.find('.spa-shell-main-nav')
    };
  };
  // End DOM method /setJqueryMap/

  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------

  //-------------------- END EVENT HANDLERS --------------------

  //---------------------- BEGIN CALLBACKS ---------------------

  //----------------------- END CALLBACKS ----------------------

  //------------------- BEGIN PUBLIC METHODS -------------------
  // Begin Public method /initModule/
  // Example   : ucp.shell.initModule( $('#app_div_id') );
  // Purpose   :
  //   Directs the Shell to offer its capability to the user
  // Arguments :
  //   * $container (example: $('#app_div_id')).
  //     A jQuery collection that should represent 
  //     a single DOM container
  // Action    :
  //   Populates $container with the shell of the UI
  //   and then configures and initializes feature modules.
  //   The Shell is also responsible for browser-wide issues
  //   such as URI anchor and cookie management
  // Returns   : none 
  // Throws    : none
  //
  initModule = function ( $container ) {
    // load HTML and map jQuery collections
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    ucp.search.initModule( jqueryMap.$searchForm );

  };
  // End PUBLIC method /initModule/

  return { initModule : initModule };
  //------------------- END PUBLIC METHODS ---------------------
}());
