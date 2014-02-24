'use strict';

angular.module('ez.datedropdowns', [])

.factory('dateutils', function() {
  // validate if entered values are a real date
  function validateDate(date) {
    var d = new Date(date.year, date.month, date.day);
    return d && (d.getMonth() === date.month && d.getDate() === Number(date.day));
  }

  // reduce the day count if not a valid date (e.g. 30 february)
  function changeDate(date) {
    if (date.day > 28) {
      date.day--;
      return date;
    }
    // this case should not exist with a restricted input
    // if a month larger than 11 is entered
    else if (date.month > 11) {
      date.day = 31;
      date.month--;
      return date;
    }
  }

  var self = this;
  this.days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  this.months = [{
    value: 0,
    name: 'January'
  }, {
    value: 1,
    name: 'February'
  }, {
    value: 2,
    name: 'March'
  }, {
    value: 3,
    name: 'April'
  }, {
    value: 4,
    name: 'May'
  }, {
    value: 5,
    name: 'June'
  }, {
    value: 6,
    name: 'July'
  }, {
    value: 7,
    name: 'August'
  }, {
    value: 8,
    name: 'September'
  }, {
    value: 9,
    name: 'October'
  }, {
    value: 10,
    name: 'November'
  }, {
    value: 11,
    name: 'December'
  }];

  return {
    checkDate: function(date) {
      if (isNaN(date.day) || isNaN(date.month) || isNaN(date.year)) {
        return false;
      }
      if (date.day <= 28) return date;
      if (validateDate(date)) {
        // update the model when the date is correct
        return date;
      } else {
        // change the date on the scope and try again if invalid
        return this.checkDate(changeDate(date));
      }
    },
    correctDate: function(isForward, intendedDate) {
      var today = new Date();
      if (isForward && intendedDate <= today)
        intendedDate = today.setDate(today.getDate() + 1);
      else if (!isForward && intendedDate > today)
        intendedDate = today;
      return intendedDate;
    },
    get: function(name) {
      return self[name];
    }
  };
})

.directive('ezdatedropdowns', ['dateutils',
  function(dateutils, $log) {
    return {
      restrict: 'A',
      replace: true,
      require: 'ngModel',
      scope: {
        model: '=ngModel'
      },
      controller: ['$scope', 'dateutils',
        function($scope, dateutils) {

          // set up arrays of values for dropdown
          $scope.days = dateutils.get('days');
          $scope.months = dateutils.get('months');

          // split the current date into sections
          $scope.dateFields = {};

          $scope.$watch('model', function(newDate) {
            $scope.dateFields.day = new Date(newDate).getDate();
            $scope.dateFields.month = new Date(newDate).getMonth();
            $scope.dateFields.year = new Date(newDate).getFullYear();
          });
        }
      ],
      template: '<div>' +
        '  <div class="form-group noPadding" style="display:inline-block" ng-if="!noDay">' +
        '    <select class="form-control" name="dateFields.day" ng-model="dateFields.day" class="form-control" ng-options="day for day in days" ng-disabled="disableFields"><option value="" disabled>Day</option></select>' +
        '  </div>' +
        '  <div class="form-group noPadding" style="display:inline-block">' +
        '    <select class="form-control" name="dateFields.month" ng-model="dateFields.month" class="form-control" ng-options="month.value as month.name for month in months" value="{{dateField.month}}" ng-disabled="disableFields"><option value="" disabled>Month</option></select>' +
        '  </div>' +
        '  <div class="form-group noPadding" style="display:inline-block">' +
        '    <select class="form-control" name="dateFields.year" ng-model="dateFields.year" class="form-control" ng-options="year for year in years" ng-disabled="disableFields"><option value="" disabled>Year</option></select>' +
        '  </div>' +
        '</div>',
      link: function(scope, element, attrs, ctrl) {
        // allow overwriting of the
        if (attrs.dayDivClass) {
          angular.element(element[0].children[0]).removeClass('');
          angular.element(element[0].children[0]).addClass(attrs.dayDivClass);
        }
        if (attrs.dayClass) {
          angular.element(element[0].children[0].children[0]).removeClass('form-control');
          angular.element(element[0].children[0].children[0]).addClass(attrs.dayClass);
        }
        if (attrs.monthDivClass) {
          angular.element(element[0].children[1]).removeClass('');
          angular.element(element[0].children[1]).addClass(attrs.monthDivClass);
        }
        if (attrs.monthClass) {
          angular.element(element[0].children[1].children[0]).removeClass('form-control');
          angular.element(element[0].children[1].children[0]).addClass(attrs.monthClass);
        }
        if (attrs.yearDivClass) {
          angular.element(element[0].children[2]).removeClass('');
          angular.element(element[0].children[2]).addClass(attrs.yearDivClass);
        }
        if (attrs.yearClass) {
          angular.element(element[0].children[2].children[0]).removeClass('form-control');
          angular.element(element[0].children[2].children[0]).addClass(attrs.yearClass);
        }

        var noDay = (attrs.noDay) ? true : false;
        var defaultDay = (attrs.noDay) ? eval(attrs.noDay) : 31;

        scope.noDay = noDay;

        // set the years drop down from attributes or defaults
        var currentYear = new Date().getFullYear();
        var numYears = parseInt(attrs.numYears, 10) || 130;

        var direction = (attrs.dateDirection) ? attrs.dateDirection : '-';
        var isForward = direction === '+';
        var oldestYear = (!isForward) ? currentYear - numYears : currentYear + numYears;

        scope.years = [];
        if (!isForward) {
          for (var i = currentYear; i >= oldestYear; i--) {
            scope.years.push(i);
          }
        } else {
          for (var i = currentYear; i < oldestYear; i++) {
            scope.years.push(i);
          }
        }

        (function() {
          // set model data to blank if it not valid
          var date = scope.model;
          // add missing year if not in the list
          if (date && date.getFullYear() < oldestYear)
            scope.years.push(date.getFullYear());

          if (scope.model && scope.model != dateutils.correctDate(isForward, date)) {
            scope.model = "";
          }
        })();

        // pass down the ng-disabled property
        scope.$parent.$watch(attrs.ngDisabled, function(newVal) {
          scope.disableFields = newVal;
        });

        var validator = function() {
          var valid = true;
          if (isNaN(scope.dateFields.day) && isNaN(scope.dateFields.month) && isNaN(scope.dateFields.year)) {
            valid = true;
          } else if (!isNaN(scope.dateFields.day) && !isNaN(scope.dateFields.month) && !isNaN(scope.dateFields.year)) {
            valid = true;
          } else valid = false;

          ctrl.$setValidity('ctdatedropdowns', valid);
          return valid;
        };

        var validatorNoDay = function() {
          var valid = true;
          if (isNaN(scope.dateFields.month) && isNaN(scope.dateFields.year)) {
            valid = true;
          } else if (!isNaN(scope.dateFields.month) && !isNaN(scope.dateFields.year)) {
            valid = true;
          } else valid = false;

          ctrl.$setValidity('ezdatedropdowns', valid);
          return valid;
        };

        scope.$watch('dateFields | json', function() {
          if (!noDay && validator()) {
            // update the date or return false if not all date fields entered.
            var date = dateutils.checkDate({
              year: scope.dateFields.year,
              month: scope.dateFields.month,
              day: scope.dateFields.day
            });
            if (date) {
              scope.dateFields = date;
            }
            var intendedDate = new Date(scope.dateFields.year, scope.dateFields.month, scope.dateFields.day);
            scope.model = dateutils.correctDate(isForward, intendedDate);
          } else if (noDay && validatorNoDay()) {
            // update the date or return false if not all date fields entered.
            var date = dateutils.checkDate({
              year: scope.dateFields.year,
              month: scope.dateFields.month,
              day: defaultDay
            });
            if (date) {
              scope.dateFields = date;
            }
            var intendedDate = new Date(scope.dateFields.year, scope.dateFields.month, scope.dateFields.day);
            scope.model = dateutils.correctDate(isForward, intendedDate);
          }
        });
      }
    };
  }
]);