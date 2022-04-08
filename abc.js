/*
 * @Author: Wang JianLei 
 * @Date: 2020-03-30 15:50:27 
 * @Last Modified by: Wang JianLei
 * @Last Modified time: 2020-06-03 10:16:17
 */
/**************************************************************
**********代码内容主要是加载各类矢量数据，包括在线和本地***********
**************************************************************/
$(function () {
 var RootURL = getWinURL(window.location.href);
 // 获取地址url
 function getWinURL(url) {
     var url_index = url.lastIndexOf("/");
     return url.substr(0, url_index);
 }

 var geojsonOptions = {
     clampToGround: true
 };//确保加入的图层贴地
 var geoserverUrl;
 $("#loadFeatureLayer").change(function () {
     var option = $(this).val();
     switch (option) {
         case "加载WFS（geoserver）":
             geoserverUrl = 'http://localhost:8080/geoserver/CesiumTest_WFS';//geoserver服务地址WFS
             //定义各参数
             var param = {
                 service: 'WFS',
                 version: '1.0.0',
                 request: 'GetFeature',
                 typeName: 'WFS',
                 outputFormat: 'application/json'
             };
             $.ajax({
                 url: geoserverUrl + "/ows" + getParamString(param, geoserverUrl),
                 cache: false,
                 async: true,
                 success: function (data) {
                     var dataPromise = Cesium.GeoJsonDataSource.load(data);
                     dataPromise.then(function (dataSource) {
                         viewer.dataSources.add(dataSource);//加载服务数据
                         viewer.flyTo(dataSource);

                         //创建 属性 编辑几何 新增 删除按钮
                         var WFS_ButtonDiv = document.createElement('div');
                         WFS_ButtonDiv.id = 'WFS_ButtonDiv';
                         WFS_ButtonDiv.style.position = 'absolute';
                         WFS_ButtonDiv.style.left = '20px';
                         WFS_ButtonDiv.style.bottom = '20px';
                         var content = '<button class="cesium-button">属性</button> <button class="cesium-button">编辑几何</button> <button class="cesium-button">新增</button> <button class="cesium-button">删除</button>';
                         WFS_ButtonDiv.innerHTML = content;
                         document.getElementById('MapContainer').appendChild(WFS_ButtonDiv);

                         var handler = null;
                         var flag = true;
                         $('#WFS_ButtonDiv button').click(function (e) {
                             var m_div = document.getElementById('propertiesDiv');
                             if (m_div) {
                                 document.getElementById('MapContainer').removeChild(m_div);
                             }
                             var value = this.innerText;
                             switch (value) {
                                 case '属性':
                                     if (handler != null) {
                                         handler.destroy();
                                     }
                                     handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
                                     var ellipsoid = viewer.scene.globe.ellipsoid;
                                     handler.setInputAction(function (movement) {
                                         console.log('属性展示和编辑');
                                         //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
                                         cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
                                         if (cartesian) {
                                             //将笛卡尔坐标转换为地理坐标
                                             var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                                             //将弧度转为度的十进制度表示
                                             var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
                                             var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
                                             var point = longitudeString + ',' + latitudeString;
                                             queryWFSByPoint(geoserverUrl, point, param.typeName, ShowAndEditWfsLayerAttributes);
                                         }
                                     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                                     break;
                                 default:
                                     break;
                             }
                         });
                     })
                 },
                 error: function (data) {
                     console.log("error");
                 }
             });
             consoleLog(option);
             break;

         default:
             break;
     }
 });
})

function consoleLog(value) {
 console.log(value);
}

/*图层几何编辑
*****@method AddNewWfsLayer
*****@param geoserverUrl Geoserver发布的WFS服务地址
*****@param data 图层数据
*/
function EditWfsLayerGeomertry(geoserverUrl, data) {
 console.log('data', data);
 var m_div = document.getElementById('propertiesDiv');
 if (m_div) {
     document.getElementById('MapContainer').removeChild(m_div);
 }
 if (data && data.features.length > 0) {
     //气泡窗口显示
     var properties = data.features[0].properties;
     var id = data.features[0].id;
     var geometry = data.features[0].geometry;
     var o_Div = document.createElement('div');//属性提示的 DIV 元素
     o_Div.id = 'propertiesDiv';
     document.getElementById('MapContainer').appendChild(o_Div);

     var content = '<p>' + id + '</p>';
     for (var key in properties) {
         var keyName = key;
         var keyValue = properties[key];
         content += '<span>' + keyName + ':</span><input type="text" id="' + keyName + '" value = "' + keyValue + '" /></br>';
     }
     content += '<button type="button" id="editBtn">几何编辑保存</button>';
     $("#propertiesDiv").show();
     $("#propertiesDiv").empty();
     $("#propertiesDiv").append(content);
     $("#editBtn").click(function () {
         getAttributesList();
         if (id) {
             //记录构造polygon，为后续几何图形的编辑做准备
             var polygon = '';
             var pointsArray=new Array();
             var data = geometry.coordinates[0][0];
             for (var i = 0; i < data.length; i++) {
                 var item = data[i];
                 var C3=Cesium.Cartesian3.fromDegrees(item[0],item[1]);
                 let point = viewer.entities.add({
                     name: ' ',
                     position: cartesian,
                     point: {
                         color: Cesium.Color.WHITE,
                         pixelSize: 50,
                         outlineColor: Cesium.Color.BLACK,
                         outlineWidth: 1,
                         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                     }
                 });
                 polygon += item[0] + ',' + item[1] + ',' + item[2] + ' ';
             }
             polygon += data[0][0] + ',' + data[0][1] + ',' + data[0][2];

             var attributesList = getAttributesList();//获取字段名和字段值键值对//暂时数组形式记录
             var typename = id.substr(0, id.indexOf('.'));
             EditWfsLayerAttributs(geoserverUrl, typename, id, polygon, attributesList, refreshLayer);
         }
     });
 }
}



/*图层属性展示和编辑
*****@method ShowAndEditWfsLayerAttributes
*****@param geoserverUrl Geoserver发布的WFS服务地址
*****@param data 图层数据
*/
function ShowAndEditWfsLayerAttributes(geoserverUrl, data) {
 console.log('data', data);
 var m_div = document.getElementById('propertiesDiv');
 if (m_div) {
     document.getElementById('MapContainer').removeChild(m_div);
 }
 if (data && data.features.length > 0) {
     //气泡窗口显示
     var properties = data.features[0].properties;
     var id = data.features[0].id;
     var geometry = data.features[0].geometry;
     var o_Div = document.createElement('div');//属性提示的 DIV 元素
     o_Div.id = 'propertiesDiv';
     document.getElementById('MapContainer').appendChild(o_Div);

     var content = '<p>' + id + '</p>';
     for (var key in properties) {
         var keyName = key;
         var keyValue = properties[key];
         content += '<span>' + keyName + ':</span><input type="text" id="' + keyName + '" value = "' + keyValue + '" /></br>';
     }
     content += '<button type="button" id="editBtn">编辑属性并保存</button>';
     $("#propertiesDiv").show();
     $("#propertiesDiv").empty();
     $("#propertiesDiv").append(content);
     $("#editBtn").click(function () {
         getAttributesList();
         if (id) {
             //记录构造polygon，为后续几何图形的编辑做准备
             var polygon = '';
             var data = geometry.coordinates[0][0];
             for (var i = 0; i < data.length; i++) {
                 var item = data[i];
                 polygon += item[0] + ',' + item[1] + ',' + item[2] + ' ';
             }
             polygon += data[0][0] + ',' + data[0][1] + ',' + data[0][2];

             var attributesList = getAttributesList();//获取字段名和字段值键值对//暂时数组形式记录
             var typename = id.substr(0, id.indexOf('.'));
             EditWfsLayerAttributs(geoserverUrl, typename, id, polygon, attributesList, refreshLayer);
         }
     });
 }
}

function getAttributesList() {
 var List = new Array();
 var texts = $('#propertiesDiv input[type=text]');
 for (let i = 0; i < texts.length; i++) {
     const element = texts[i];
     var cur_Attribute = new Array(element.id, element.value);
     List.push(cur_Attribute);
 }
 return List;
}

/*图层编辑
*****@method EditWfsLayerAttributs
*****@param geoserverUrl Geoserver发布的WFS服务地址
*****@param typeName 图层名
*****@param fid 记录fid值
*****@param attributesList 记录当前图层所有的字段名和字段值【字段名，字段值】
*****@return callback
要注意，字段名不能有中文，绝对不能有
*/
function EditWfsLayerAttributs(geoserverUrl, typeName, fid, polygon, attributesList, callback) {
 var content = '';
 content += '<?xml version="1.0" encoding="utf-8"?>';
 content += '<wfs:Transaction version="1.0.0" service="WFS" username="admin" password="476852678" xmlns:CesiumTest_WFS="http://CesiumTest_WFS" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml">';
 content += '<wfs:Update typeName="CesiumTest_WFS:' + typeName + '">';
 for (let i = 0; i < attributesList.length; i++) {
     const element = attributesList[i];
     content += '<wfs:Property> <wfs:Name>' + element[0] + '</wfs:Name> <wfs:Value>' + element[1] + '</wfs:Value> </wfs:Property>';
 }

 content += '<wfs:Property>';
 content += '<wfs:Name>the_geom</wfs:Name>';
 content += '<wfs:Value>';
 content += '<gml:MultiPolygon> <gml:polygonMember> <gml:Polygon> <gml:outerBoundaryIs> <gml:LinearRing> <gml:coordinates>' + polygon + '</gml:coordinates> </gml:LinearRing> </gml:outerBoundaryIs> </gml:Polygon> </gml:polygonMember> </gml:MultiPolygon>'
 content += '</wfs:Value>';
 content += '</wfs:Property>';

 content += '<ogc:Filter> <ogc:FeatureId fid="' + fid + '" /> </ogc:Filter>'
 content += '</wfs:Update>';
 content += '</wfs:Transaction>';

 $.ajax({
     url: geoserverUrl + '/wfs',
     async: true,
     data: content,
     type: 'post',
     contentType: 'text/xml',
     success(result) {
         callback(result);
     },
     error(err) {
         console.log(err);
     }
 })
}

/*通过点选来选择并获取图层对象
***@method queryWFSByPoint
***@param geoserverUrl Geoserver发布的WFS服务地址
***@param point 查询的位置点
***@param typeName 图层名称
***@return 返回值是点选位置查询获取的的图层对象
*/
function queryWFSByPoint(geoserverUrl, point, typeName, callback) {
 var filter = '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
 filter += '<Intersects>';
 filter += '<PropertyName>the_geom</PropertyName>';
 filter += '<gml:Point>';
 filter += '<gml:coordinates>' + point + '</gml:coordinates>';
 filter += '</gml:Point>';
 filter += '</Intersects>';
 filter += '</Filter>';
 var param = {
     service: 'WFS',
     version: '1.0.0',
     request: 'GetFeature',
     typeName: typeName,
     outputFormat: 'application/json',
     filter: filter
 };
 $.ajax({
     url: geoserverUrl + '/ows' + getParamString(param, geoserverUrl),
     async: true,
     type: 'GET',
     dataType: 'json',
     success(result) {
         callback(geoserverUrl, result);//返给回调函数ShowAndEditWfsLayer
     },
     error(err) {
         console.log(err);
     }
 })
}

//请求参数转化
function getParamString(obj, existingUrl, uppercase) {
 var params = [];
 for (var i in obj) {
     params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
 }
 return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
}

//编辑完成后的回调函数
function refreshLayer(data) {
 var m_div = document.getElementById('propertiesDiv');
 if (m_div) {
     document.getElementById('MapContainer').removeChild(m_div);
 }
}
