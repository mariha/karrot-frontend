class CreateGroupController {
  constructor($state, GroupService, Geocoding) {
    "ngInject";
    Object.assign(this, {
      $state,
      GroupService,
      Geocoding,
      groupData: {},
      mapCenter: {},
      mapDefaults: {
        scrollWheelZoom: false,
        zoomControl: false,
        dragging: false
      }
    });
  }
  geoLookup(query) {
    return this.Geocoding.lookupAddress(query);
  }
  setGeo(item) {
    if (!item) return;
    this.mapCenter.zoom = 10;
    this.groupData.lat = item.lat;
    this.groupData.lng = item.lng;
    this.groupData.address = item.name;
    this.mapCenter.lat = item.lat;
    this.mapCenter.lng = item.lng;
  }
  createGroup() {
    this.GroupService.create(this.groupData).then((data) => {
      this.$state.go("groupDetail", { groupId: data.id });
    }).catch((error) => {
      this.error = error.data;
    });
  }
}

export default CreateGroupController;
