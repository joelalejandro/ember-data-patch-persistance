import DS from 'ember-data';
import Ember from 'ember';

export function initialize() {
  if (Ember.libraries) {
    Ember.libraries.register('Patch Persistance Addon', 'Enabled');
  }

  DS.Model.reopen({
    _isPatch: false,
    patch: function() {
      var promiseLabel = "DS: Model#patch " + this;
      var resolver = Ember.RSVP.defer(promiseLabel);
      var _this = this;

      this._isPatch = true;
      this.get('store').scheduleSave(this, resolver);

      this.eachRelationship(function(name, relationship) {
        if (relationship.kind === "belongsTo") {
          if (typeof _this.get('_data.' + name) === 'object') {
            if (_this.get('_data.' + name + '.id') != _this.get(name + '.id')) {
              _this._attributes[name] = _this.get(name + '.id');
            };
          } else {
            if (relationship.options.alwaysPatch) {
              _this._attributes[name] = _this.get(name + '.id');
            } else {
              if (_this.get('_data.' + name) != _this.get(name + '.id')) {
                _this._attributes[name] = _this.get(name + '.id');
              }
            }
          }
        }
      });

      this._inFlightAttributes = this._attributes;
      this._attributes = Ember.create(null);

      return DS.PromiseObject.create({
        promise: resolver.promise
      });
    }
  });

  DS.RESTAdapter.reopen({
    updateRecord: function (store, type, snapshot) {
      var data = {};
      var serializer = store.serializerFor(type.typeKey);

      serializer.serializeIntoHash(data, type, snapshot);

      var id = snapshot.id;

      if (snapshot.record._isPatch) {
        data[type.typeKey] = snapshot.record._inFlightAttributes;
        data[type.typeKey].id = id;
      }

      var url = this.buildURL(type.typeKey, id, snapshot, 'updateRecord');

      var ajax = this.ajax(url, snapshot.record._isPatch ? "PATCH" : "PUT", { data: data });

      if (snapshot.record._isPatch) {
        snapshot.record._isPatch = false;
      }

      return ajax;
    }
  });
}

export default {
  name: 'patch-persistance',
  initialize: initialize
};
