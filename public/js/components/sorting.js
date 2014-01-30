app.views.sorting = Backbone.View.extend({
  initialize: function() {
    this.$sortable = this.$('.sortable');
    this._setupSorts();
  },
  events: {
    'click .sortable': '_onClick'
  },
  sorts: {
    'name': {
      asc: function(model) { return model.get('name') },
    },
    'performance': {
      asc: function(model) {
        var score = 0;
        var subjectnames = app.subjects.selected().map(function(model) { return model.get('name'); });
        var scores = _.compact(subjectnames.map(function(name) { return model.getSubject(name); }));
        scores.forEach(function(subject) {
          // Try to suppress the urge of finding any logic behind this.
          var total = subject['total'];
          if (total > 0) {
            if (total > 5) score += 1e9;
            else score += 1e7;
            if (subject['A'] != null) {
              score += 1e5 * (subject['A*'] + subject['A']) / total;
              score += 1e3 * (subject['B'] + subject['C']) / total;
              score += 1e1 * (subject['D'] + subject['E']) / total;
              score -= 1e1 * (subject['NR']) / total;
            }
          }
        });
        return score;
      }
    },
    'total-a2': {
      asc: function(model) { try { return model.get('performance')[YEAR]['students']['a-level'] } catch(e) {} }
    },
    'total-1618': { 
      asc: function(model) { try { return model.get('performance')[YEAR]['students']['16-18'] } catch(e) {} }
    },
    'aps-student': { 
      asc: function(model) { try { return model.get('performance')[YEAR]['aps']['a-level'].student } catch(e) {} }
    },
    'aps-entry': {
      asc: function(model) { try { return model.get('performance')[YEAR]['aps']['a-level'].entry } catch(e) {} }
    },
    'supertype': {
      asc: function(model) { return model.get('supertype') }
    },
    'distance': {
      asc: function(model) { return model.get('distance') }
    }
  },
  sort: function(key, order, defaultOrder) {
    defaultOrder = defaultOrder || 'desc';
    var fn, sorts = this.sorts[key];
    if (key == null) {
      this.$sortable.removeClass('sorted-asc').removeClass('sorted-desc');
      app.compare.comparator = app.results.comparator = undefined;
    } else if (sorts) {
      if (!order) {
        if (app.results.comparator === sorts[defaultOrder]) order = (defaultOrder === 'desc') ? 'asc' : 'desc';
        else order = defaultOrder;
      }
      fn = sorts[order];
      if (fn) {
        this.$sortable.removeClass('sorted-asc').removeClass('sorted-desc');
        this.findEl(key).addClass('sorted-'+order);
        app.compare.comparator = app.results.comparator = fn;
        app.compare.sort();
        app.results.sort();
      }
    }
  },
  findEl: function(sort) {
    var length = this.$sortable.length;
    for (var i = 0; i < length; i++) {
      var $elem = this.$sortable.eq(i);
      if ($elem.data('sort') === sort) return $elem;
    }
    return $();
  },
  // Fills in the "gaps" in this.sorts.
  // If only an ascending sort is provided, it generates
  // a descending one, and vice versa.
  _setupSorts: function() {
    var sorts = this.sorts;
    for (var key in sorts) {
      var orders = sorts[key];
      if      (orders['desc'] && !orders['asc']) orders['asc'] = app.utils.reverseSortBy(orders['desc']);
      else if (!orders['desc'] && orders['asc']) orders['desc'] = app.utils.reverseSortBy(orders['asc']);
    }
  },
  _onClick: function(event) {
    var $target = $(event.currentTarget);
    var key = $target.data('sort');
    var defaultOrder = $target.data('order');
    this.sort(key, null, defaultOrder);
  }
});