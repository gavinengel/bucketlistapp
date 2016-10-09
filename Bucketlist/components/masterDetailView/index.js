'use strict';

app.masterDetailView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_masterDetailView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_masterDetailView
(function(parent) {
    var dataProvider = app.data.bucketlist,
        /// start global model properties

        markerLayers = {},
        getLocation = function(options) {
            var d = new $.Deferred();
            if (options === undefined) {
                options = {
                    enableHighAccuracy: true
                };
            }
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    d.resolve(position);
                },
                function(error) {
                    d.reject(error);
                },
                options);
            return d.promise();
        },

        setupMap = function(container, dataModel, markersLayer) {
            var markersLayerContainer = container + 'markersLayer';
            if (masterDetailViewModel[container]) {
                masterDetailViewModel[container].remove();
                masterDetailViewModel[container] = null;
            }
            masterDetailViewModel[container] = L.map(container);
            masterDetailViewModel[markersLayerContainer] = new L.FeatureGroup();
            var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                id: 'mapbox.streets',
                accessToken: "pk.eyJ1IjoiZ2F2aW5lbmdlbCIsImEiOiJjaXUzNWw0bDQwaGkxMnVqd21la3lhbG9jIn0.a1ezjDK34ARm1IWYi7l71A"
            });
            masterDetailViewModel[container].addLayer(tileLayer);
            masterDetailViewModel[container].addLayer(masterDetailViewModel[markersLayerContainer]);
            masterDetailViewModel[container].on('click', function(e) {
                masterDetailViewModel.set("itemDetailsVisible", false);
            });
            addMarkers(container, dataModel, markersLayer);
        },
        addMarkers = function(container, data, markersLayer) {
            var markersLayerContainer = container + 'markersLayer';
            getLocation()
                .then(function(userPosition) {
                    var marker,
                        currentMarker, currentMarkerIcon,
                        latLang,
                        mapBounds,
                        userLatLang = L.latLng(userPosition.coords.latitude, userPosition.coords.longitude);
                    masterDetailViewModel[container].setView(userLatLang, 15, {
                        animate: false
                    });
                    mapBounds = masterDetailViewModel[container].getBounds();
                    masterDetailViewModel[markersLayerContainer].clearLayers();
                    if (!markersLayer) {
                        if (data) {
                            if (data.hasOwnProperty('latitude') && data.hasOwnProperty('longitude')) {
                                latLang = [data.latitude, data.longitude];
                            } else if (data.hasOwnProperty('Latitude') && data.hasOwnProperty('Longitude')) {
                                latLang = [data.Latitude, data.Longitude];
                            }
                            if (latLang && latLang[0] !== undefined && latLang[1] !== undefined) {
                                marker = L.marker(latLang, {
                                    clickable: false
                                });
                                masterDetailViewModel[markersLayerContainer + 'Marker'] = latLang;
                                mapBounds.extend(latLang);
                                masterDetailViewModel[markersLayerContainer].addLayer(marker);
                            }
                        } else { //When no data => add form
                            marker = L.marker(userLatLang, {
                                draggable: false
                            });
                            masterDetailViewModel[markersLayerContainer].addLayer(marker);
                            masterDetailViewModel[markersLayerContainer + 'Marker'] = [userLatLang.lat, userLatLang.lng];
                        }
                    } else {
                        if (!masterDetailViewModel[markersLayer + 'markersLayerMarker']) {
                            masterDetailViewModel[markersLayer + 'markersLayerMarker'] = userLatLang;
                        }
                        marker = L.marker(masterDetailViewModel[markersLayer + 'markersLayerMarker'], {
                            draggable: true,
                        });
                        marker.on('dragend', function(e) {
                            var selectedPosition = e.target.getLatLng();
                            setupMap(markersLayer, {
                                longitude: selectedPosition.lng,
                                latitude: selectedPosition.lat
                            });
                        });
                        masterDetailViewModel[markersLayerContainer].addLayer(marker);
                    }
                    currentMarkerIcon = L.divIcon({
                        className: 'current-marker',
                        iconSize: [20, 20],
                        iconAnchor: [20, 20]
                    });
                    currentMarker = L.marker(userLatLang, {
                        icon: currentMarkerIcon
                    });
                    masterDetailViewModel[markersLayerContainer].addLayer(currentMarker);
                    masterDetailViewModel.set("mapVisble", true);
                    masterDetailViewModel[container].invalidateSize({
                        reset: true
                    });
                    masterDetailViewModel[container].fitBounds(mapBounds, {
                        padding: [20, 20]
                    });
                    app.mobileApp.pane.loader.hide();
                })
                .then(null, function(error) {
                    app.mobileApp.pane.loader.hide();
                    alert("code: " + error.code + "message: " + error.message);
                });
        },
        /// end global model properties

        fetchFilteredData = function(paramFilter, searchFilter) {
            var model = parent.get('masterDetailViewModel'),
                dataSource;

            if (model) {
                dataSource = model.get('dataSource');
            } else {
                parent.set('masterDetailViewModel_delayedFetch', paramFilter || null);
                return;
            }

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },
        processImage = function(img) {

            function isAbsolute(img) {
                if  (img && (img.slice(0,  5)  ===  'http:' || img.slice(0,  6)  ===  'https:' || img.slice(0,  2)  ===  '//'  ||  img.slice(0,  5)  ===  'data:')) {
                    return true;
                }
                return false;
            }

            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (!isAbsolute(img)) {
                var setup = dataProvider.setup || {};
                img = setup.scheme + ':' + setup.url + setup.appId + '/Files/' + img + '/Download';
            }

            return img;
        },
        flattenLocationProperties = function(dataItem) {
            var propName, propValue,
                isLocation = function(value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'Activities',
                dataProvider: dataProvider
            },
            change: function(e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    /// start flattenLocation property
                    /// end flattenLocation property

                }
            },
            error: function(e) {

                if (e.xhr) {
                    var errorText = "";
                    try {
                        errorText = JSON.stringify(e.xhr);
                    } catch (jsonErr) {
                        errorText = e.xhr.responseText || e.xhr.statusText || 'An error has occurred!';
                    }
                    alert(errorText);
                }
            },
            schema: {
                model: {
                    fields: {
                        'Text': {
                            field: 'Text',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
        },
        /// start data sources
        /// end data sources
        masterDetailViewModel = kendo.observable({
            _dataSourceOptions: dataSourceOptions,
            fixHierarchicalData: function(data) {
                var result = {},
                    layout = {};

                $.extend(true, result, data);

                (function removeNulls(obj) {
                    var i, name,
                        names = Object.getOwnPropertyNames(obj);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];

                        if (obj[name] === null) {
                            delete obj[name];
                        } else if ($.type(obj[name]) === 'object') {
                            removeNulls(obj[name]);
                        }
                    }
                })(result);

                (function fix(source, layout) {
                    var i, j, name, srcObj, ltObj, type,
                        names = Object.getOwnPropertyNames(layout);

                    if ($.type(source) !== 'object') {
                        return;
                    }

                    for (i = 0; i < names.length; i++) {
                        name = names[i];
                        srcObj = source[name];
                        ltObj = layout[name];
                        type = $.type(srcObj);

                        if (type === 'undefined' || type === 'null') {
                            source[name] = ltObj;
                        } else {
                            if (srcObj.length > 0) {
                                for (j = 0; j < srcObj.length; j++) {
                                    fix(srcObj[j], ltObj[0]);
                                }
                            } else {
                                fix(srcObj, ltObj);
                            }
                        }
                    }
                })(result, layout);

                return result;
            },
            itemClick: function(e) {
                var dataItem = e.dataItem || masterDetailViewModel.originalItem;

                app.mobileApp.navigate('#components/masterDetailView/details.html?uid=' + dataItem.uid);

            },
            addClick: function() {
                app.mobileApp.navigate('#components/masterDetailView/add.html');
            },
            editClick: function() {
                var uid = this.originalItem.uid;
                app.mobileApp.navigate('#components/masterDetailView/edit.html?uid=' + uid);
            },
            deleteItem: function() {
                var dataSource = masterDetailViewModel.get('dataSource');

                dataSource.remove(this.originalItem);

                dataSource.one('sync', function() {
                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function() {
                    dataSource.cancelChanges();
                });

                dataSource.sync();
            },
            deleteClick: function() {
                var that = this;

                navigator.notification.confirm(
                    'Are you sure you want to delete this item?',
                    function(index) {
                        //'OK' is index 1
                        //'Cancel' - index 2
                        if (index === 1) {
                            that.deleteItem();
                        }
                    },
                    '', ['OK', 'Cancel']
                );
            },
            detailsShow: function(e) {
                var uid = e.view.params.uid,
                    dataSource = masterDetailViewModel.get('dataSource'),
                    itemModel = dataSource.getByUid(uid);

                masterDetailViewModel.setCurrentItemByUid(uid);

                /// start detail form show
                /// end detail form show
            },
            setCurrentItemByUid: function(uid) {
                var item = uid,
                    dataSource = masterDetailViewModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.Text) {
                    itemModel.Text = String.fromCharCode(160);
                }

                masterDetailViewModel.set('originalItem', itemModel);
                masterDetailViewModel.set('currentItem',
                    masterDetailViewModel.fixHierarchicalData(itemModel));

                /// start detail form initialization
                /// end detail form initialization

                return itemModel;
            },
            linkBind: function(linkString) {
                var linkChunks = linkString.split('|');
                if (linkChunks[0].length === 0) {
                    return this.get('currentItem.' + linkChunks[1]);
                }
                return linkChunks[0] + this.get('currentItem.' + linkChunks[1]);
            },
            imageBind: function(imageField) {
                if (!imageField) {
                    return;
                }
                if (imageField.indexOf('|') > -1) {
                    return processImage(this.get('currentItem.' + imageField.split('|')[0]));
                }
                return processImage(imageField);
            },
            currentItem: {}
        });

    parent.set('addItemViewModel', kendo.observable({
        /// start add model properties
        /// end add model properties
        /// start add model functions

        editLocation: function(field) {
            field = field.target.id.split('-')[0];
            $("#locationEditor").show();
            setupMap('locationEditMap', null, field);
        },
        useCurrentLocation: function(field) {

            field = field.target.id.split('-')[0];
            var addFormData = this.get('addFormData');
            getLocation()
                .then(function(userPosition) {
                    addFormData[field].set('latitude', userPosition.coords.latitude);
                    addFormData[field].set('longitude', userPosition.coords.longitude);
                    setupMap(field, userPosition.coords);
                });

        },
        /// end add model functions

        onShow: function(e) {
            this.set('addFormData', {
                end: '',
                start: '',
                textField: '',
                /// start add form data init

                location: {
                    longitude: '',
                    latitude: ''
                },
                /// end add form data init

            });
            /// start add form show

            setupMap('location');
            /// end add form show

        },
        onCancel: function() {
            /// start add model cancel
            /// end add model cancel
        },
        onSaveClick: function(e) {
            var addFormData = this.get('addFormData'),
                filter = masterDetailViewModel && masterDetailViewModel.get('paramFilter'),
                dataSource = masterDetailViewModel.get('dataSource'),
                addModel = {};

            function saveModel(data) {
                /// start add form data save
                addModel.End = addFormData.end;
                addModel.Start = addFormData.start;
                addModel.Text = addFormData.textField;

                addModel.Location = {
                        latitude: masterDetailViewModel['locationmarkersLayerMarker'][0],
                        longitude: masterDetailViewModel['locationmarkersLayerMarker'][1]
                    }
                    /// end add form data save

                dataSource.add(addModel);
                dataSource.one('change', function(e) {
                    app.mobileApp.navigate('#:back');
                });

                dataSource.sync();
                app.clearFormDomData('add-item-view');
            };

            /// start add form save
            /// end add form save
            /// start add form save handler
            saveModel();
            /// end add form save handler
        }
    }));

    parent.set('editItemViewModel', kendo.observable({
        /// start edit model properties
        /// end edit model properties
        /// start edit model functions
        /// end edit model functions
        editFormData: {},
        onShow: function(e) {
            var that = this,
                itemUid = e.view.params.uid,
                dataSource = masterDetailViewModel.get('dataSource'),
                itemData = dataSource.getByUid(itemUid),
                fixedData = masterDetailViewModel.fixHierarchicalData(itemData);

            this.set('itemData', itemData);
            this.set('editFormData', {
                /// start edit form data init
                /// end edit form data init
            });
            /// start edit form show
            /// end edit form show
        },
        linkBind: function(linkString) {
            var linkChunks = linkString.split(':');
            return linkChunks[0] + ':' + this.get('itemData.' + linkChunks[1]);
        },
        onSaveClick: function(e) {
            var that = this,
                editFormData = this.get('editFormData'),
                itemData = this.get('itemData'),
                dataSource = masterDetailViewModel.get('dataSource');

            /// edit properties
            /// start edit form data save
            /// end edit form data save

            function editModel(data) {
                /// start edit form data prepare
                /// end edit form data prepare
                dataSource.one('sync', function(e) {
                    /// start edit form data save success
                    /// end edit form data save success

                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function() {
                    dataSource.cancelChanges(itemData);
                });

                dataSource.sync();
                app.clearFormDomData('edit-item-view');
            };
            /// start edit form save
            /// end edit form save
            /// start edit form save handler
            editModel();
            /// end edit form save handler
        },
        onCancel: function() {
            /// start edit form cancel
            /// end edit form cancel
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('masterDetailViewModel', masterDetailViewModel);
            var param = parent.get('masterDetailViewModel_delayedFetch');
            if (typeof param !== 'undefined') {
                parent.set('masterDetailViewModel_delayedFetch', undefined);
                fetchFilteredData(param);
            }
        });
    } else {
        parent.set('masterDetailViewModel', masterDetailViewModel);
    }

    parent.set('onShow', function(e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper'),
            dataSourceOptions = masterDetailViewModel.get('_dataSourceOptions'),
            dataSource;

        if (param || isListmenu) {
            backbutton.show();
            backbutton.css('visibility', 'visible');
        } else {
            if (e.view.element.find('header [data-role="navbar"] [data-role="button"]').length) {
                backbutton.hide();
            } else {
                backbutton.css('visibility', 'hidden');
            }
        }

        dataSource = new kendo.data.DataSource(dataSourceOptions);
        masterDetailViewModel.set('dataSource', dataSource);
        fetchFilteredData(param);
    });

})(app.masterDetailView);

// START_CUSTOM_CODE_masterDetailViewModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_masterDetailViewModel