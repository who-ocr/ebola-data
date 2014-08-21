window.WHO={Models:{},Collections:{},Views:{},Routers:{},init:function(){"use strict";WHO.router=new WHO.Routers.App,Backbone.history.start()}},$(document).ready(function(){"use strict";WHO.init()}),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Map=Backbone.View.extend({events:{},initialize:function(a){this.listenTo(a.zoom,"zoom:end",this.getmap),this.spinner=new Spinner({color:"#888",length:2,speed:.8}).spin(document.getElementById("map-loader")),this.layers=[]},load:function(){this.collection.length?this.getmap():(this.listenToOnce(this.collection,"loaded",this.getmap),this.collection.query())},getmap:function(a){var b=a.level||WHO.defaultZoom;this.level!==b&&(5>b?this.getBounds(WHO.Models.Country,"country"):7>b?this.getBounds(WHO.Models.Province,"province"):this.getBounds(WHO.Models.District,"district"),this.level=b)},getBounds:function(a,b){var a=WHO.models[b]||new a;this.model=a,this.maptype=b,"FeatureCollection"!==a.get("type")?(WHO.models[b]=a,this.listenToOnce(a,"change",this.render),a.fetch()):this.render()},removeLayers:function(){_.each(this.layers,function(a){WHO.map.removeLayer(a)})},drawBounds:function(a){var b,c,d=(_.values(a),{type:"FeatureCollection",features:_.filter(this.model.attributes.features,function(b){return a[b.id]>1})});"country"===this.maptype?(b=["#fff","rgb(255,252,224)","rgb(252,202,78)","rgb(250,175,78)","rgb(249,145,77)","rgb(246,104,61)"],c=chroma.scale(b).domain([1,6])):(b=["#fff","rgb(252,202,78)","rgb(250,175,78)","rgb(249,145,77)","rgb(246,104,61)"],c=chroma.scale(b).domain([1,5]));var e=L.geoJson(d,{style:function(b){return{color:"rgb(254,243,183)",fillColor:c(a[b.id]),opacity:.7,fillOpacity:.7,weight:1}},onEachFeature:function(a,b){b.on({dblclick:function(a){WHO.map.setView(a.latlng,WHO.map.getZoom()+1)}})}}).addTo(WHO.map);this.spinner.stop(),e.bringToBack(),this.layers.push(e)},render:function(){this.layers.length&&this.removeLayers();for(var a,b,c={},d=0,e=this.collection.models.length;e>d;++d)a=this.collection.models[d],b=a.get("geoID"),c[b]=a.get("level");this.drawBounds(c)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Table=Backbone.View.extend({tagName:"div",id:"",className:"",events:{},initialize:function(){this.listenTo(this.model,"change",this.render)},render:function(){this.$el.html(this.template(this.model.toJSON()))}})}(),WHO.Views=WHO.Views||{},function(){"use strict";function a(a){return a.setDate(a.getDate()-a.getDay()),new Date(a.getFullYear(),a.getMonth(),a.getDate())}WHO.Views.epiGraph=Backbone.View.extend({events:{},initialize:function(){this.spinner=new Spinner({color:"#888",length:2,speed:.8}).spin(document.getElementById("epi-graph"))},load:function(){this.collection.length?this.render():(this.listenToOnce(this.collection,"loaded",this.render),this.collection.query())},drawChart:function(a){this.spinner.stop();var b=$("#test-index");b.append('<p style="font-size: 10px;">1</p>'),b.append("<p>"+this.$el.width()+"</p>");var c={top:10,right:60,bottom:30,left:60};b.append('<p style="font-size: 10px;">1</p>');var d=this.$el.width()-c.left-c.right;b.append('<p style="font-size: 10px;">1</p>');var e=180-c.top-c.bottom;b.append('<p style="font-size: 10px;">1</p>');var f=d3.max(a,function(a){return a.total});b.append('<p style="font-size: 10px;">1</p>');var g=d3.scale.linear().rangeRound([0,d]).domain([0,a.length]),h=d3.scale.linear().range([e,0]).domain([0,f]),i=Math.floor(d/a.length)-1,j=i/2,k=this.order,l=[];b.append('<p style="font-size: 10px;">1</p>'),_.each(a,function(a,b){var c=0;a.bars=_.map(a.vals,function(a,b){return{name:k[b],y0:c,y1:c+=a,val:a}}),b%5===0&&l.push({position:b,display:a.time})}),b.append('<p style="font-size: 10px;">1</p>');var m=d3.svg.axis().scale(h).orient("right"),n=d3.time.format("%d-%m-%Y"),o=_.template("<h4><%= date %></h4><p>Confirmed: <%= confirmed %><br />Probable: <%= probable %><br />Suspected: <%= suspected %>");b.append('<p style="font-size: 10px;">1</p>');var p=d3.tip().attr("class","d3-tip").html(function(a){return o({date:n(a.time),confirmed:a.vals[0],probable:a.vals[1],suspected:a.vals[2]})});b.append('<p style="font-size: 10px;">1</p>');var q=d3.select("#epi-graph").append("svg").attr("width",d+c.left+c.right).attr("height",e+c.top+c.bottom).append("g").attr("transform","translate("+c.left+","+c.top+")");b.append('<p style="font-size: 10px;">1</p>');var r=q.selectAll(".week").data(a).enter().append("g").attr("class","week").attr("transform",function(a,b){return"translate("+(g(b)-j)+",0)"}).on("mouseover",p.show).on("mouseout",p.hide);b.append('<p style="font-size: 10px;">1</p>');var s=r.selectAll("rect").data(function(a){return a.bars}).enter().append("rect").attr("width",i).attr("y",function(a){return h(a.y1)}).attr("height",function(a){return e-h(a.val)||1}).attr("class",function(a){return a.name});$("#test-index").append("<p>"+q.length+" "+s.length+" "+s[0][0].nodeName+"</p>");var t=q.append("g").attr("class","x axis").attr("transform","translate(0,"+(e+3)+")").selectAll(".tick").data(l).enter().append("g").attr("class","tick").attr("transform",function(a){return"translate("+g(a.position)+",0)"});t.append("line").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",5).style("stroke-width","2"),t.append("text").text(function(a){return n(a.display)}).style("text-anchor","middle").attr("dy","15px"),q.append("g").attr("transform","translate("+d+",0)").attr("class","y axis").call(m).append("text").attr("transform","rotate(-90)").attr("y",6).attr("dy","-.8em").style("text-anchor","end").text("Cases");var u=a.length;r.transition().duration(0).delay(function(a,b){return 20*(u-b)}).attr("class","week active")},render:function(){var b,c,d,e=new Date(this.collection.at(0).get("datetime")),f=(new Date(this.collection.at(this.collection.length-1).get("datetime")),6048e5),g=Date.parse(a(e)),h=g+f,i={Suspected:0,Probable:0,Confirmed:0,Total:0},j=[_.clone(i)],k=0;j[0].week=new Date(g);for(var l=0,m=this.collection.length;m>l;++l){for(b=this.collection.at(l),c=b.get("datetime");c>h;)k+=1,j.push(_.clone(i)),j[k].week=new Date(h),h+=f;d=b.get("case category"),d in j[k]&&(j[k][d]+=1,j[k].Total+=1)}this.order=["confirmed","probable","suspected"];var j=_.map(j.slice(0,-1),function(a){return{vals:[a.Confirmed,a.Probable,a.Suspected],total:a.Total,time:new Date(a.week)}});this.drawChart(j)}})}(),WHO.Collections=WHO.Collections||{},function(){"use strict";WHO.Collections.Response=Backbone.Collection.extend({model:WHO.Models.Response})}(),WHO.Collections=WHO.Collections||{},function(){"use strict";WHO.Collections.Cases=Backbone.Collection.extend({initialize:function(){this.ref=new Firebase("https://luminous-heat-4380.firebaseio.com/cases_admin_aug17")},query:function(){var a=$.proxy(this.onload,this);this.ref.once("value",a)},onload:function(a){for(var b,c=a.val(),d=Date.parse(new Date),e=Date.parse(new Date("2013","11","20")),f=0,g=c.length;g>f;++f)b=c[f].date,c[f].datetime=Date.parse(b);c=_.filter(c,function(a){return!isNaN(a.datetime)&&a.datetime<d&&a.datetime>e}),c=_.sortBy(c,function(a){return a.datetime}),this.reset(c),this.trigger("loaded",c)}})}(),WHO.Collections=WHO.Collections||{},function(){"use strict";WHO.Collections.GlobalRisk=Backbone.Collection.extend({initialize:function(){this.ref=new Firebase("https://luminous-heat-4380.firebaseio.com/allResponse")},query:function(){var a=$.proxy(this.onload,this);this.ref.once("value",a)},onload:function(a){var b=a.val();this.reset(b),this.trigger("loaded",b)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Deployment=Backbone.Model.extend({url:"",initialize:function(){},defaults:{},validate:function(){},parse:function(a){return a}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Case=Backbone.Model.extend({initialize:function(){},defaults:{}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Country=Backbone.Model.extend({url:"geo/ADM0.topojson",parse:function(a){return topojson.feature(a,a.objects.ADM0)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Province=Backbone.Model.extend({url:"geo/ADM1.topojson",parse:function(a){return topojson.feature(a,a.objects.ADM1)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.District=Backbone.Model.extend({url:"geo/ADM2.topojson",parse:function(a){return topojson.feature(a,a.objects.ADM2)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Dropdown=Backbone.View.extend({template:_.template($("#dropdown-template").html()),events:{"click a":"select"},initialize:function(a){this.options=a.options,this.selected=this.options[0].display,this.render()},render:function(){this.$el.html(this.template({options:this.options,selected:this.selected})),this.$selected=this.$(".selected"),this.$dropdown=this.$(".dropdown")},select:function(a){return a.preventDefault(),a=a.toElement,this.$selected.text(a.innerHTML),this.$dropdown.toggleClass("open"),WHO.router.set(this.className,a.className),!1}})}(),WHO.Routers=WHO.Routers||{},function(){"use strict";function a(){var a=new WHO.Models.Zoom;WHO.collections={cases:new WHO.Collections.Cases,response:new WHO.Collections.Response,globalrisk:new WHO.Collections.GlobalRisk,clinics:new WHO.Models.Clinics},WHO.mapview=new WHO.Views.Map({el:"#map",id:"map",map:WHO.map,collection:WHO.collections.globalrisk,zoom:a}),WHO.markerview=new WHO.Views.Marker({el:"#map",id:"map",map:WHO.map,collection:WHO.collections.cases,zoom:a,model:new WHO.Models.Centroids}),WHO.epiGraph=new WHO.Views.epiGraph({el:"#epi-graph",id:"epi-graph",collection:WHO.collections.cases}),new WHO.Views.Clinic({el:"#map",id:"map",map:WHO.map,model:WHO.collections.clinics,zoom:a}),new WHO.Views.Legend({el:"#legend",id:"legend",model:a}),WHO.models={},WHO.models={},WHO.map.whenReady(function(){$('<div id="map-overlay-container"></div>').appendTo(WHO.$map)}),WHO.mapview.load(),WHO.epiGraph.load(),c=!0}var b="total",c=!1,d=[{display:"Most recent",val:"recent"},{display:"All",val:"all"}],e=[{display:"All cases",val:"total"},{display:"Confirmed cases",val:"confirmed"},{display:"Suspected cases",val:"suspected"},{display:"Probable cases",val:"probable"}],f={time:"",type:""};WHO.defaultZoom=3,WHO.map=L.mapbox.map("map","nate.j8n0m4ld").setView([22.23,8],WHO.defaultZoom),WHO.map.scrollWheelZoom.disable(),WHO.$map=$("#map"),WHO.Routers.App=Backbone.Router.extend({routes:{"":"newload",":time/:type":"newload"},newload:function(){a(),WHO.markerview.setFilter({type:b,time:"recent"}),WHO.markerview.load(),f.time="recent",f.type=b},newfilter:function(g,h){c||a(),-1!==_.map(d,function(a){return a.val}).indexOf(g)&&-1!==_.map(e,function(a){return a.val}).indexOf(h)?(WHO.markerview.setFilter({type:h,time:g}),this.navigate(g+"/"+h,{trigger:!1}),f.time=g,f.type=h):(WHO.markerview.setFilter({type:b,time:"recent"}),this.navigate("recent/"+b,{trigger:!1}),f.time="recent",f.type=b),WHO.markerview.load()},set:function(a,b){f[a]=b,this.navigate(f.time+"/"+f.type,{trigger:!0})}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Marker=Backbone.View.extend({initialize:function(a){this.listenTo(a.zoom,"zoom:end",this.getmap),this.layers=[]},setFilter:function(a){this.filters=a},load:function(){this.collection.length?this.getmap():(this.listenToOnce(this.collection,"loaded",this.getmap),this.collection.query())},getmap:function(a){var b,c;b=a&&a.level?a.level:this.level?this.level:WHO.defaultZoom,c=5>b?"country":7>b?"province":"district",this.level=b,this.maptype=c,this.popup=new L.Popup({autoPan:!1}),this.getCentroids()},getCentroids:function(){"FeatureCollection"!==this.model.get("type")?(this.listenToOnce(this.model,"change",this.render),this.model.fetch()):this.render()},removeLayers:function(){_.each(this.layers,function(a){WHO.map.removeLayer(a)})},render:function(){var a,b,c,d,e,f,g,h={},i=this.collection.at(this.collection.models.length-1).get("datetime"),j=0;switch(this.maptype){case"country":c="ADM0_NAME",d="ADM2_CODE";break;case"province":c="ADM1_NAME",d="ADM2_CODE";break;case"district":c="ADM2_NAME",d="ADM2_CODE"}for(var k=0,l=this.collection.models.length;l>k;++k)e=this.collection.models[k],a=e.get("case category").toLowerCase(),f=e.get(c),"ADM0_NAME"==c?(b=e.get(d).substring(0,5),g=b.concat("000000000000000")):"ADM1_NAME"==c?(b=e.get(d).substring(0,8),g=b.concat("000000000000")):g=e.get(d),"For Aggregates"===a||i-e.get("datetime")<=j||(g in h||(h[g]={name:f,confirmed:0,probable:0,suspected:0,hcw:0,deaths:0}),h[g][a]+=1,"TRUE"==e.get("HCW")&&(h[g].hcw+=1),"Dead"==e.get("outcome")&&(h[g].deaths+=1));_.each(h,function(a){a.total=a.confirmed+a.probable+a.suspected}),this.cases=h,this.drawMarkers(h)},drawMarkers:function(a){this.layers.length&&this.removeLayers();var b,c=("country"===this.maptype?3:5,this.maptype),d=0,e=this.popup,f=this.filters.type,g=_.max(_.map(a,function(a){return a.total})),h=d3.scale.quantize().domain([0,g]).range([50,400,800,1200,1600,2e3,2400,2800,3200,3600]),i={type:"Topology",features:_.chain(this.model.get("features")).filter(function(b){return a[b.id]}).sortBy(function(b){return-a[b.id][f]}).value()};WHO.map.on("popupclose",function(){d=0});var j=WHO.map.getZoom()<5?3.2:2.8,k=L.geoJson(i,{pointToLayer:function(b,c){return L.circleMarker(c,{radius:Math.sqrt(h(a[b.id][f])/Math.PI)/(j/1.88),weight:1.5,color:"#fff",opacity:.7,fillColor:"#99000d",fillOpacity:.7})},onEachFeature:function(f,g){g.on({dblclick:function(a){WHO.map.setView(a.latlng,WHO.map.getZoom()+1)},mousemove:function(f){if(0==d){var g=f.target;e.setLatLng(f.latlng),e.setContent('<div class="marker-title">'+c.charAt(0).toUpperCase()+c.slice(1)+": "+a[g.feature.id].name+"</div> Click for more information"),e._map||e.openOn(WHO.map),window.clearTimeout(b)}},mouseout:function(){0==d&&(b=window.setTimeout(function(){WHO.map.closePopup()},100))},click:function(f){d=1;var g=f.target,h=a[g.feature.id];e.setLatLng(f.latlng),e.setContent('<div class="marker-title">'+c.charAt(0).toUpperCase()+c.slice(1)+": "+a[g.feature.id].name+'</div><table class="popup-click"><tr><td>Confirmed cases</td><td>'+h.confirmed+"</td></tr><tr><td>Probable cases</td><td>"+h.probable+"</td></tr><tr><td>Suspected cases</td><td>"+h.suspected+"</td></tr><tr><td>---</td><td>---</td></tr><tr><td>Total Deaths</td><td>"+h.deaths+"</td></tr><tr><td>Health Care Workers Affected</td><td>"+h.hcw+"</td></tr></table>"),e._map||e.openOn(WHO.map),window.clearTimeout(b)}})}}).addTo(WHO.map);k.bringToFront(),this.layers.push(k)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Zoom=Backbone.Model.extend({initialize:function(){var a,b=!1,c=this;WHO.map.on("zoomstart",function(){b=!0,window.clearTimeout(a)}),WHO.map.on("zoomend",function(){b=!1,a=window.setTimeout(function(){b||c.trigger("zoom:end",{level:WHO.map.getZoom()})},400)})}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Centroids=Backbone.Model.extend({url:"geo/centroids.topojson",parse:function(a){return topojson.feature(a,a.objects.centroids)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Legend=Backbone.View.extend({initialize:function(){this.listenTo(this.model,"zoom:end",this.render),this.$country=this.$(".country"),this.$district=this.$(".district"),this.onCountry=!0},render:function(a){var b=a.level||WHO.defaultZoom;this.onCountry&&b>=5?(this.$country.hide(),this.$district.show(),this.onCountry=!1):!this.onCountry&&5>b&&(this.$country.show(),this.$district.hide(),this.onCountry=!0)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Clinic=Backbone.View.extend({initialize:function(a){this.layers=[],this.listenTo(a.zoom,"zoom:end",this.getmap),this.listenToOnce(this.model,"loaded",this.onLoad),this.model.query(),this.on=!1,this.popup=new L.Popup({autoPan:!1})},onLoad:function(){this.getmap({level:WHO.defaultZoom})},getmap:function(a){var b=a.level||WHO.defaultZoom;b>=7&&!this.on&&(this.render(),this.on=!0),7>b&&this.on&&(this.remove(),this.on=!1)},remove:function(){_.each(this.layers,function(a){WHO.map.removeLayer(a)})},render:function(){this.layers.length&&this.remove();var a=this.popup,b=L.geoJson(this.model.attributes,{pointToLayer:function(a,b){return L.marker(b,{icon:L.icon({iconSize:[32,32],iconUrl:"img/medical-64x64.png"}),opacity:.95})},onEachFeature:function(b,c){c.on({dblclick:function(a){WHO.map.setView(a.latlng,WHO.map.getZoom()+1)},click:function(b){var c=b.target.feature.properties;a.setLatLng(b.latlng),a.setContent('<div class="marker-title">'+c.CITY+", "+c.COUNTRY+'</div><table class="popup-click"><tr><td>Facility</td><td>'+c.LOCATIONS+"</td></tr><tr><td>Function</td><td>"+c.FUNCTION+"</td></tr><tr><td>Partners</td><td>"+c.Partners+"</td></tr><tr><td>Bed Capacity</td><td>"+c.Bed_capacity_current+"</td></tr><tr><td>Laboratory</td><td>"+c.Serving_Lab_Location+"</td></tr><tr><td>Status</td><td>"+c.Status_ECT+"</td></tr></table>"),a._map||a.openOn(WHO.map)}})}}).addTo(WHO.map);this.layers.push(b)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Clinics=Backbone.Model.extend({initialize:function(){this.ref=new Firebase("https://luminous-heat-4380.firebaseio.com/ebolaClinics_aug17")},query:function(){var a=$.proxy(this.onload,this);this.ref.once("value",a)},onload:function(a){var b=a.val();this.set(topojson.feature(b,b.objects.ebolaClinics)),this.trigger("loaded")}})}();