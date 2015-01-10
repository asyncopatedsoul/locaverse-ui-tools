/*
  Creator: Maelig GOHIN For ARCA-Computing - www.arca-computing.fr
  Date: July 2014
  Version: 1.1.4

  Description:  MultipleDatePicker is an Angular directive to show a simple calendar allowing user to select multiple dates.
          A callback is called everytime a de/selection is done.
          Css style can be changed by editing less or css stylesheet.
          See scope declaration below for options you can pass through html directive.
          Feel free to edit and share this piece of code, our idea is to keep simple ;)
 */

angular.module('customFormControls', [])
  
  .directive('datepickerValidator', function() {
      return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

          ctrl.$validators.dateRequired = function(modelValue, viewValue) {

            console.log('dateRequired',modelValue, viewValue);

            if (ctrl.$isEmpty(modelValue)) {
              return false;
            }

            if (viewValue.length>0) {
              return true;
            }

            // it is invalid
            return false;
          };
        }
      };
    })

  .directive('integer', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {

        var INTEGER_REGEXP = /^\-?\d+$/;

        ctrl.$validators.integer = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (INTEGER_REGEXP.test(viewValue)) {
            // it is valid
            return true;
          }

          // it is invalid
          return false;
        };
      }
    };
  })

  .directive('multipleDatePicker', ['$log', function($log){
  "use strict";
  return {
    restrict: 'AE',
    scope: {
      /*
      * Type: function(timestamp, boolean)
      * Will be called when un/select a date
      * Param timestamp will be the date at midnight
      * */
      callback: '&',
      dayClick: '=?',
      fieldValueChanged: '=?',
      dayHover: '=?',

      minDate: '=',
      maxDate: '=',
      /*
      * whitelisted dates for selection
      */
      daysOn: '=',
      /*
      * Type: function(newMonth, oldMonth)
      * Will be called when month changed
      * Param newMonth/oldMonth will be the first day of month at midnight
      * */
      monthChanged: '=?',
      /*
      * Type: array of milliseconds timestamps
      * Days already selected
      * */
      daysSelected: '=?',
      /*
      * Type: array of integers
      * Recurrent week days not selectables
      * /!\ Sunday = 0, Monday = 1 ... Saturday = 6
      * */
      weekDaysOff: '=?',
      /*
      * Type: array of milliseconds timestamps
      * Days not selectables
      * */
      daysOff: '=?',
      /*
      * Type: boolean
      * Sunday be the first day of week, default will be Monday
      * */
      sundayFirstDay: '=?',
      /*
       * Type: boolean
       * if true can't go back in months before today's month
       * */
      disallowBackPastMonths: '=',
      /*
       * Type: boolean
       * if true can't go in futur months after today's month
       * */
      disallowGoFuturMonths: '='
    },
    template: '<div class="multiple-date-picker">'+
            '<div class="picker-top-row">'+
              '<div class="text-center picker-navigate picker-navigate-left-arrow" ng-class="{\'disabled\':disableBackButton}" ng-click="previousMonth()">&lt;</div>'+
              '<div class="text-center picker-month">{{month.format(\'MMMM YYYY\')}}</div>'+
              '<div class="text-center picker-navigate picker-navigate-right-arrow" ng-class="{\'disabled\':disableNextButton}" ng-click="nextMonth()">&gt;</div>'+
            '</div>'+
            '<div class="picker-days-week-row">'+
              '<div class="weekday-header text-center" ng-repeat="day in daysOfWeek" ng-click=selectWeekdayInRange($index)>{{day}}</div>'+
            '</div>'+
            '<div class="picker-days-row">'+
              '<div class="text-center picker-day picker-empty" ng-repeat="x in emptyFirstDays">&nbsp;</div>'+
              '<div class="text-center picker-day" ng-repeat="day in days" ng-click="toggleDay($event, day)" ng-mouseover="hoverDay($event, day)" ng-mouseleave="dayHover($event, day)" ng-class="{\'picker-selected\':day.selected, \'picker-off\':!day.selectable, \'today\':day.today}">{{day ? day.format(\'D\') : \'\'}}</div>'+
              '<div class="text-center picker-day picker-empty" ng-repeat="x in emptyLastDays">&nbsp;</div>'+
            '</div>'+
          '</div>',
    link: function(scope, elm, attrs, ctrl){

      /*utility functions*/
      var checkNavigationButtons = function(){
        var today = moment(),
          previousMonth = moment(scope.month).subtract(1, 'month'),
          nextMonth = moment(scope.month).add(1, 'month');
        scope.disableBackButton = scope.disallowBackPastMonths && today.isAfter(previousMonth, 'month');
        scope.disableNextButton= scope.disallowGoFuturMonths && today.isBefore(nextMonth, 'month');
      },
      getDaysOfWeek = function(){
        /*To display days of week names in moment.lang*/
        var momentDaysOfWeek = moment().localeData()._weekdaysMin,
          days = [];
        
        for(var i = 1; i < 7; i++){
          days.push(momentDaysOfWeek[i]);
        }

        if(scope.sundayFirstDay){
          days.splice(0, 0, momentDaysOfWeek[0]);
        }else{
          days.push(momentDaysOfWeek[0]);
        }
        
        return days;
      };

      /*scope functions*/
      scope.$watch('daysSelected', function(newValue) {
        if(newValue){
          var momentDates = [];
          newValue.map(function(timestamp){
            momentDates.push(moment(timestamp));
          });
          scope.convertedDaysSelected = momentDates;
          scope.generate();
        }
      }, true);

      scope.$watch('weekDaysOff', function() {
        scope.generate();
      }, true);

      scope.$watch('daysOff', function() {
        scope.generate();
      }, true);

      scope.$watch('daysOn', function() {
        scope.generate();
      }, true);

      scope.$watch('minDate', function(newValue,oldValue) {
        console.log(newValue,oldValue);
        scope.clearDatesBeyondRange();
        scope.generate();
      });

      scope.$watch('maxDate', function(newValue,oldValue) {
        console.log(newValue,oldValue);
        scope.clearDatesBeyondRange();
        scope.generate();
      });

      scope.$watch('convertedDaysSelected', function(newValue) {});

      scope.syncShippingDatesSelected = function(){
        console.log('Session set shippingDates',scope.convertedDaysSelected);

        var formattedSubmission = [];

        scope.convertedDaysSelected.forEach(function(moment){
          formattedSubmission.push(new Date(moment.valueOf()));
          //formattedSubmission.push(moment.valueOf());
        })

        //Session.set('shippingDates',formattedSubmission);

        if(typeof(scope.fieldValueChanged) == "function"){
          console.log('fieldValueChanged callback');
          scope.fieldValueChanged(formattedSubmission)
        }
      }

      //default values
      scope.month = scope.month || moment().startOf('day');
      scope.days = [];
      scope.convertedDaysSelected = scope.convertedDaysSelected || [];
      scope.weekDaysOff = scope.weekDaysOff || [];
      scope.daysOff = scope.daysOff || [];
      scope.disableBackButton = false;
      scope.disableNextButton = false;      
      scope.daysOfWeek = getDaysOfWeek();


      scope.clearDatesBeyondRange = function(){

        scope.convertedDaysSelected = scope.convertedDaysSelected.filter(function(date) {
              //return date.valueOf() === momentDate.valueOf();
              return date.isAfter(scope.minDate, 'day') &&  date.isBefore(scope.maxDate, 'day');
            });
        console.log('clearDatesBeyondRange', scope.convertedDaysSelected);
        scope.syncShippingDatesSelected();
      }

      /**
       * Called when user clicks a date
       * @param Event event the click event
       * @param Moment momentDate a moment object extended with selected and isSelectable booleans 
       * @see #momentDate
       * @callback dayClick
       * @callback callback deprecated
       */
      scope.toggleDay = function(event, momentDate){
        event.preventDefault();

        console.log('toggleDay', momentDate.valueOf(), momentDate.format('MM DD YYYY'));
        var prevented = false;

        event.preventDefault = function() {
          prevented = true;
        };

        

        if(momentDate.selectable && !prevented){
          momentDate.selected = !momentDate.selected;

          if(momentDate.selected) {
            scope.convertedDaysSelected.push(momentDate);
          } else {
            scope.convertedDaysSelected = scope.convertedDaysSelected.filter(function(date) {
              //return date.valueOf() === momentDate.valueOf();
              return !date.isSame(momentDate, 'day');
            });

            console.log('current dates selected: ',scope.convertedDaysSelected);
          }

          // if(typeof(scope.callback) === "function"){
          //   $log.warn('callback option deprecated, please use dayClick');
          //   scope.callback({timestamp:momentDate.valueOf(), selected:momentDate.selected});
          // }

          scope.syncShippingDatesSelected();
        }

        if(typeof scope.dayClick == 'function') {
          scope.dayClick(event, momentDate);
        }
      };

      /**
       * Hover day
       * @param Event event
       * @param Moment day
       */
      scope.hoverDay = function(event, day) {
        event.preventDefault();
        var prevented = false;

        event.preventDefault = function() {
          prevented = true ;
        };

        if(typeof scope.dayHover == 'function') {
          scope.dayHover(event, day);
        }

        if(!prevented) {
          day.hover = event.type === 'mouseover' ? true : false;
        }
      };

      /*Navigate to previous month*/
      scope.previousMonth = function(){
        if(!scope.disableBackButton){
          var oldMonth = moment(scope.month);
          scope.month = scope.month.subtract(1, 'month');
          if(typeof scope.monthChanged == 'function') {
            scope.monthChanged(scope.month, oldMonth);
          }
          scope.generate();
        }
      };

      scope.selectWeekdayInRange = function(day){

        console.log('selectWeekdayInRange',day);

        var selection = [];

        // get total days between start and end date
        var days = moment(scope.maxDate).diff(moment(scope.minDate),'days');
        console.log('days bewtween:',days);
        // get total weeks 
        var weeks = Math.floor(days/7+1);
        console.log('weeks bewtween:',weeks);


        var start = moment(scope.minDate);
        console.log('start weekday: ',start.day());

        // get the next valid weekday
        var weekdayBefore, weekdayAfter;
        var diff = start.day() - day;

        console.log('start date: ',start.format('MM DD YYYY'));
        console.log(diff);


        if (diff < 0) {
          // target weekday comes after start day
          weekdayBefore = moment(scope.minDate).day(-(7-day));
          weekdayAfter = moment(scope.minDate).day(day);

        } else if (diff > 0) {
          // target weekday comes before start day
          weekdayBefore = moment(scope.minDate).subtract( (start.day()-day), 'days');
          weekdayAfter = moment(scope.minDate).day(day+7);
        }

        if (diff!==0) {
          console.log('weekdayBefore date: ',weekdayBefore.format('MM DD YYYY'));
          console.log('weekdayAfter date: ',weekdayAfter.format('MM DD YYYY'));

          start = start.diff(weekdayBefore, 'days') > 0 ? weekdayAfter : weekdayBefore; 
        }

        console.log('valid start date:', start.format('MM DD YYYY'));

        selection.push(start.valueOf())
        
        // add day of week for each week
        for (var i=1;i<weeks;i++){
          start.add(7, 'days');

          if (moment.min(start,moment(scope.maxDate)) == start) {
            selection.push(start.valueOf());
          }          
        }

        console.log('selected weekdays: ',selection);

        scope.days.forEach(function(date){

          selection.forEach(function(ms){

            var dateAlreadySelected = scope.convertedDaysSelected.some(function(date){ return date.isSame(moment(ms),'day') });

            if (date.isSame(moment(ms), 'day') && !dateAlreadySelected) {
              console.log('date matched');
              date.selected = true;
              scope.convertedDaysSelected.push(date);
            }
          })
        });

        console.log('current dates selected',scope.convertedDaysSelected);

        scope.syncShippingDatesSelected();
      };

      /*Navigate to next month*/
      scope.nextMonth = function(){
        if(!scope.disableNextButton){
          var oldMonth = moment(scope.month);
          scope.month = scope.month.add(1, 'month');
          if(typeof scope.monthChanged == 'function') {
            scope.monthChanged(scope.month, oldMonth);
          }
          scope.generate();
        }
      };

      /*Check if the date is off : unselectable*/
      scope.isDayOff = function(scope, date){

        // console.log('check day off',moment(date).format('MM DD YYYY '));
        // console.log('min date',moment(scope.minDate).format('MM DD YYYY '));
        // console.log('max date',moment(scope.maxDate).format('MM DD YYYY '));

        var isOnWhitelist = true;

        if (scope.daysOn && scope.daysOn.length>0) {
          isOnWhitelist = scope.daysOn.some(function(ms){
            return date.isSame(moment(ms),'day');
          })
        }

        var date = moment(date), minDate = moment(scope.minDate), maxDate = moment(scope.maxDate);
        var isBeforeMinDate = date.diff(minDate,'days') < 0;
        var isAfterMaxDate = date.diff(maxDate,'days') >= 0;

        //console.log('isBeforeMinDate',isBeforeMinDate); 
        //console.log('isAfterMaxDate',isAfterMaxDate); 

        return !isOnWhitelist || isBeforeMinDate || isAfterMaxDate
        || angular.isArray(scope.weekDaysOff) && scope.weekDaysOff.some(function(dayOff){
          return date.day() === dayOff;
        }) || angular.isArray(scope.daysOff) && scope.daysOff.some(function(dayOff){
          return date.isSame(dayOff, 'day');
        });
      };

      /*Check if the date is selected*/
      scope.isSelected = function(scope, date){
        return scope.convertedDaysSelected.some(function(d){
          return date.isSame(d, 'day');
        });
      };

      /*Generate the calendar*/
      scope.generate = function(){
        var previousDay = moment(scope.month).date(0),
          firstDayOfMonth = moment(scope.month).date(1),
          days = [],
          now = moment(),
          lastDayOfMonth = moment(firstDayOfMonth).endOf('month'),
          maxDays = lastDayOfMonth.date();

        scope.emptyFirstDays = [];

        var emptyFirstDaysStartIndex;
        if(firstDayOfMonth.day() === 0){
          emptyFirstDaysStartIndex = scope.sundayFirstDay ? 0 : 6;
        }else{
          emptyFirstDaysStartIndex = firstDayOfMonth.day() - (scope.sundayFirstDay ? 0 : 1);
        }
        for (var i = emptyFirstDaysStartIndex; i > 0; i--) {
          scope.emptyFirstDays.push({});
        }

        for (var j = 0; j < maxDays; j++) {
          var date = moment(previousDay.add(1, 'days'));
          date.selectable = !scope.isDayOff(scope, date);
          date.selected = scope.isSelected(scope, date);
          date.today = date.isSame(now, 'day');
          days.push(date);
        }

        scope.emptyLastDays = [];
        var emptyLastDaysStartIndex = scope.sundayFirstDay ? 6 : 7;
        if(lastDayOfMonth.day() === 0 && !scope.sundayFirstDay){
          emptyLastDaysStartIndex = 0;
        }else{
          emptyLastDaysStartIndex -= lastDayOfMonth.day();          
        }
        for (var k = emptyLastDaysStartIndex; k > 0; k--) {
          scope.emptyLastDays.push({});
        }
        scope.days = days;
        checkNavigationButtons();
      };

      scope.generate();
    }
  };
}]);
