# Patch Persistance addon for Ember Data

This addon allows you to save a partial model using the HTTP PATCH verb on a `DS.RESTAdapter`.

## Installation

`ember install ember-data-patch-persistance`

## Usage

### Persisting data

Whenever you want to push data to the server using PATCH, instead of using `.save()`
you'll use `.patch()`, setting whatever attributes you want to save:

```js
// Let's bring a car and change its colour.
this.store.findById('car', 1).then(function(car) {
  car.set('colour', '#ff0000');
  car.patch().then(function() {
    // ...
  });
})
```

This will produce an HTTP request with this payload:

```js
PATCH /api/cars/1
{
  "car": {
    "colour": "#ff0000"
  }
}
```

The addon will automatically detect the model's changed attributes and push those
changes to the server.

### Forcing attributes into the payload

It may happen that you must push data to the server, without considering whether
if such data was modified or not. If that occurs, you can set `alwaysPatch` to
`true` in the model definition:

```js
// models/car.js
import DS from 'ember-data';

export default DS.Model.extend({
  colour: DS.attr('string'),
  wheels: DS.attr('number'),
  owner: DS.belongsTo('person', { async: true, alwaysPatch: true })
});
```

Patch Persistance plays nice with relationships as long as you follow Ember Data
conventions.

## Notes

- This addon reopens the `DS.Model` and `DS.RESTAdapter` classes; thus,
  all extended objects from these classes will have the `.patch()` method
  available. I'm considering refactoring the addon as a mixin on a future
  version, provided there is interest enough on such feature.

- The addon has been tested up to Ember Data 1.0.0-beta17, without issues.

## Have an issue?

Feel free to post an issue in this repository! :)

## Have any ideas?

By all means, feel free to make a PR!
