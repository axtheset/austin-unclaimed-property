/*
 * ucp.search.js
 * Search feature module for unclaimed property
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, ucp */

ucp.search = (function () {
  'use strict';
  //---------------- BEGIN MODULE SCOPE VARIABLES --------------
  var
    configMap = {
      main_html : String()
        + '<div class="page-header">'
            + '<h1>Unclaimed Property Check - Demo Application</h1>'
            + '<div class="well">'
              + '<p>This is a demo application using open data hosted at <a href="http://www.civicdata.com/en/home" target="_blank">CivicData.com</a>. The City of Austin supports a process by which citizens can retrieve their unclaimed property and valuables from various transactions creating a credit balance (<a href="https://www.ci.austin.tx.us/financeonline/finance/financial_docs.cfm?ws=3&pg=1" target="_blank">More Information</a>). The unclaimed property name list data used for this demo was downloaded from <a href="https://data.austintexas.gov/Financial/Unclaimed-Property/h3i4-5e5v" target="_blank">here</a> and uploaded to <a href="http://www.civicdata.com/en/dataset/unclaimed-property" target="_blank">CivicData.com</a> to demonstrate the usage of the CivicData.com API.</p>'
            + '</div>  '        
        + '</div>'
        + '<div>'
          + '<p>Enter your name below to search for unclaimed property. Be sure to try different possible spellings of your name and if searching for a company enter the company name in the Last Name field.</p>'
        + '</div>'
        + '<div class="row">'
          + '<div class="col-lg-4">'
          + '<div id="first-name-group" class="input-group">'
            + '<span class="input-group-addon">First Name</span>'
            + '<input type="text" class="form-control" id="inputFirstName">'
          + '</div>'
          + '<div id="last-name-group" class="input-group">'
            + '<span class="input-group-addon">Last Name</span>'
            + '<input type="text" class="form-control" id="inputLastName">'
          + '</div>'
          + '</div>'
        + '</div>'
        + '<div>'
            + '<button type="button" value="RunCheck" class="btn btn-lg btn-primary" id="searchSubmit" data-toggle="modal" data-target="#searchResults">Search Unclaimed Property Name List</button>'
        + '</div>'
        + '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" id="searchResults">'
        +   '<div class="modal-dialog modal-lg">'
        +     '<div class="modal-content">'
          +     '<div class="modal-header">'
            +     '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'
            +     '<h4 class="modal-title" id="resultsLabel">Modal title</h4>'
          +     '</div>'
          +     '<div class="modal-body" id="resultTable">'
          +     '</div>'
          +     '<div class="modal-body" id="nextSteps">'
                    + '<p>Contact the Treasurer, Unclaimed Property Section either by mail, by phone, or in person, with the following information: </p>'
                    + '<ul>'
                      + '<li>Owner name exactly as spelled in the listing.</li>'
                      + '<li>Current addresses, in order to mail a response. (Please allow for 30 days.)</li>'
                      + '<li>All previous addresses for the past five years, including Post Office Boxes.</li>'
                      + '<li>Social Security Number of the person listed.</li>'
                      + '<li>Daytime, 8:45 a.m. to 4:45 p.m. phone number.</li>'
                    + '</ul>'
                    + '<table class="table table-striped table-bordered table-hover">'
                      + '<tr><th>Email</th><th>By US Mail</th><th>By Phone</th><th>In Person</th></tr>'
                      + '<tr>'
                        + '<td id="requestEmail"></td>'
                        + '<td>Treasurer<br/>City of Austin<br/>Unclaimed Property Section<br/>P. O. Box 2106<br/>Austin, Texas 78768</td>'
                        + '<td>512-974-1384<br/>512-974-7890</td>'
                        + '<td>Treasurer<br/>City of Austin<br/>Regular Business Days<br/>Hours (9:00 AM - 4:00 PM)<br/>700 Lavaca Street, Ste. 1510</td>'
                    + '</table>'
                    + '<p>If you have unclaimed property in addition follow steps 3 and 4 at this site: <a href="https://www.ci.austin.tx.us/financeonline/finance/financial_docs.cfm?ws=3&pg=1" target="_blank">City of Austin Treasury, Division of Financial & Administrative Services</a>.</p>'
                    + '<p>With accurate information and no complications, your claim may be processed and a check mailed in 60 to 90 days.</p>'
          +     '</div>'
            +   '<div class="modal-footer">'
              +   '<button type="button" class="btn btn-default" id="backToSearchResults">Search Results</button>'
              +   '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
            +   '</div>' 
        +     '</div>'     
        +   '</div>'
        + '</div>',
      resourceId : "efab801d-8815-46af-8961-aec57ab8d83b",
      baseURI : "http://www.civicdata.com/api/action/datastore_search_sql?sql="
    },
    stateMap = {
            $append_target   : null
    },
    jqueryMap = {},
    
    getUnclaimedQuery, getUnclaimedMatches, showValidationError, 
    onSearchSubmit, onBackToSearchResults, showSearchResults, 
    onRowClick, showNextSteps, setJqueryMap, showPreviousSearchResults, 
    initModule;

  //----------------- END MODULE SCOPE VARIABLES ---------------

  //------------------- BEGIN UTILITY METHODS ------------------

  getUnclaimedQuery = function () {
    var 
      sql_query = "select * from \"resource_id\" where upper(\"Last\") like '" + jqueryMap.$last_name.val().toUpperCase() + "%'";

    // If first name is provided append it to the where clause  
    if (jqueryMap.$first_name.val() != null && jqueryMap.$first_name.val() != '' && jqueryMap.$first_name.val() != undefined) {
      sql_query += " and upper(\"First\") like '%" + jqueryMap.$first_name.val().toUpperCase() + "%'";          
    }

    // Sort the results
    sql_query += " order by \"Last\", \"First\", \"M\"";
    console.log(sql_query);
    return configMap.baseURI + encodeURIComponent(sql_query.replace("resource_id",configMap.resourceId));
  };

  getUnclaimedMatches = function () {

    //$.get(getUnclaimedQuery( jqueryMap.$first_name.val(), jqueryMap.$last_name.val() ), function ( data, status ) {
    //  console.log(data);
    //} );
    return $.ajax({
      url: getUnclaimedQuery( jqueryMap.$first_name.val(), jqueryMap.$last_name.val() ),
    });  
  };


  //-------------------- END UTILITY METHODS -------------------

  //--------------------- BEGIN DOM METHODS --------------------
  // Begin DOM method /setJqueryMap/
  setJqueryMap = function () {
    var
      $append_target = stateMap.$append_target;

    jqueryMap = {
      $results_label        : $append_target.find('#resultsLabel'),
      $search_results       : $append_target.find('#resultTable'),
      $next_steps           : $append_target.find('#nextSteps'),
      $next_steps_email     : $append_target.find('#requestEmail'),
      $first_name           : $append_target.find('#inputFirstName'),
      $last_name_group      : $append_target.find('#last-name-group'),
      $last_name            : $append_target.find('#inputLastName'),
      $search_submit        : $append_target.find('#searchSubmit'),
      $back_search_results  : $append_target.find('#backToSearchResults')
    };

  };
  // End DOM method /setJqueryMap/

  // Begin DOM method /showValidationError/
  showValidationError = function () {
    jqueryMap.$last_name_group.attr('class', 'input-group has-error');
    jqueryMap.$last_name.attr('placeholder', 'Last name is required for lookup');
  };
  // End DOM method /showValidationError/

  showSearchResults = function ( result_set ) {
    var 
      modal_content,
      i;

    jqueryMap.$next_steps.hide();
    jqueryMap.$search_results.empty();
    jqueryMap.$search_results.show();
    jqueryMap.$next_steps_email.empty();

    if ( result_set.length > 0) {
      
      jqueryMap.$results_label.text('Click on your name below if found:');

      modal_content = '<table class="table table-striped table-bordered table-hover">'
        + '<tr><th>Name</th></tr>';
      
      i=0;
      for ( i; i < result_set.length; i++ ) {
        modal_content += '<tr><td><a class="details" href="#">' +  result_set[i].First + ' ' + result_set[i].M + ' ' + result_set[i].Last + '</a></td></tr>';
      }

      modal_content += '</table>';
    }
    else {
      jqueryMap.$results_label.text('Search Results:');
      modal_content = '<h3>No records found for name:<br/>' + jqueryMap.$first_name.val() + ' ' + jqueryMap.$last_name.val() + '</h3>'
    }

    jqueryMap.$search_results.append(
      modal_content
    );

  };

  showNextSteps = function ( selected_name ) {
    
    
    jqueryMap.$results_label.text( 'Next Steps for ' + selected_name + ':' );
    jqueryMap.$next_steps_email.html('<a href="mailto:unclaimedproperty@austintexas.gov?Subject=Unclaimed Property Request for ' 
      + selected_name 
      + '&Body=Owner Name: ' 
      + selected_name 
      + '%0D%0ACurrent Address:%0D%0AAll Previous Addresses:%0D%0ASocial Security Number:%0D%0ADaytime Phone Number:" target="_top">Click here to send email now</a>');
    jqueryMap.$search_results.hide();
    jqueryMap.$next_steps.show();
    jqueryMap.$back_search_results.show();
  
  };

  showPreviousSearchResults = function () {
    jqueryMap.$search_results.show();
    jqueryMap.$next_steps.hide();
    jqueryMap.$back_search_results.hide();
  };

  //--------------------- END DOM METHODS ----------------------

  //------------------- BEGIN EVENT HANDLERS -------------------
  onSearchSubmit = function ( event ) {
    var search_result;

    if (jqueryMap.$last_name.val() === null || jqueryMap.$last_name.val() === "" || jqueryMap.$last_name.val() === undefined) {
      showValidationError();
      return false;
    }
    
    search_result = getUnclaimedMatches();
    
    search_result.success( function ( data ) {
      showSearchResults(data.result.records);
    });

  };

  onRowClick = function ( event ) {
    //jqueryMap.$search_results.hide();
    showNextSteps( $(this).text() );
  };

  onBackToSearchResults = function ( event ) {
    showPreviousSearchResults();
  }

  //-------------------- END EVENT HANDLERS --------------------

  //------------------- BEGIN PUBLIC METHODS -------------------

  // Begin public method /initModule/
  // Example    : spa.chat.initModule( $('#div_id') );
  // Purpose    :
  //   Directs Chat to offer its capability to the user
  // Arguments  :
  //   * $append_target (example: $('#div_id')).
  //     A jQuery collection that should represent
  //     a single DOM container
  // Action     :
  //   Appends the chat slider to the provided container and fills
  //   it with HTML content.  It then initializes elements,
  //   events, and handlers to provide the user with a chat-room
  //   interface
  // Returns    : true on success, false on failure
  // Throws     : none
  //
  initModule = function ( $append_target ) {
    // load search html and jquery cache
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    jqueryMap.$next_steps.hide();
    jqueryMap.$back_search_results.hide();
    // bind user input events
    jqueryMap.$search_submit.bind( 'click', onSearchSubmit );
    jqueryMap.$back_search_results.bind( 'click', onBackToSearchResults );
    jqueryMap.$search_results.on( 'click', ".details", onRowClick )

  };
  // End public method /initModule/

  // return public methods
  return {
    initModule        : initModule
  };
  //------------------- END PUBLIC METHODS ---------------------
}());
