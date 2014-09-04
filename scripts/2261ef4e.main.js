window.WHO={Models:{},Collections:{},Views:{},Routers:{},init:function(){"use strict";WHO.router=new WHO.Routers.App,Backbone.history.start()}},$(document).ready(function(){"use strict";WHO.init()}),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Map=Backbone.View.extend({events:{},initialize:function(){this.listenToOnce(this.collection,"loaded",function(){this.featureChange(WHO.getMapType(WHO.map.getZoom()))}),this.spinner=new Spinner({color:"#888",length:2,speed:.8}).spin(document.getElementById("map-loader")),this.layers=[]},featureChange:function(a){if(a!==this.mapType){this.mapType=a;var b=a.charAt(0).toUpperCase()+a.slice(1);this.getBounds(WHO.Models[b],a)}},addLayers:function(a){this.mapType=a;var b=a.charAt(0).toUpperCase()+a.slice(1);this.getBounds(WHO.Models[b],a)},removeLayers:function(){_.each(this.layers,function(a){WHO.map.removeLayer(a)})},getBounds:function(a,b){var a=WHO.models[b]||new a;this.model=a,this.mapType=b,"FeatureCollection"!==a.get("type")?(WHO.models[b]=a,this.listenToOnce(a,"change",this.render),a.fetch()):this.render()},render:function(){this.layers.length&&this.removeLayers();for(var a,b,c={},d=0,e=this.collection.models.length;e>d;++d)a=this.collection.models[d],b=a.get("geoID"),c[b]=a.get("level");this.risks=c,this.drawBounds()},drawBounds:function(){var a,b=this.risks,c=(_.values(b),{type:"FeatureCollection",features:_.filter(this.model.attributes.features,function(a){return b[a.id]>2})}),d=["ffffd4","#ffffff","#ff8104","#9d4e00","#623000"],e=5;a=d3.scale.ordinal().range(d).domain(d3.range(1,e));var f=L.geoJson(c,{style:function(c){return{color:"#666",fillColor:a(b[c.id]),opacity:.5,fillOpacity:.4,weight:1}},onEachFeature:function(a,b){b.on({dblclick:function(a){WHO.map.setView(a.latlng,WHO.map.getZoom()+1)}})}}).addTo(WHO.map);this.spinner.stop(),f.bringToBack(),this.layers.push(f)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Table=Backbone.View.extend({tagName:"div",id:"",className:"",events:{},initialize:function(){this.listenTo(this.model,"change",this.render)},render:function(){this.$el.html(this.template(this.model.toJSON()))}})}(),WHO.Views=WHO.Views||{},function(){"use strict";function a(a){return a.setDate(a.getDate()-a.getDay()),new Date(a.getFullYear(),a.getMonth(),a.getDate())}WHO.Views.epiGraph=Backbone.View.extend({events:{},initialize:function(){this.listenToOnce(this.collection,"loaded",this.render)},render:function(){var b,c,d,e=new Date(this.collection.at(0).get("datetime")),f=(new Date(this.collection.at(this.collection.length-1).get("datetime")),6048e5),g=Date.parse(a(e)),h=g+f,i={Suspected:0,Probable:0,Confirmed:0,Total:0},j=[_.clone(i)],k=0;j[0].week=new Date(g);for(var l=0,m=this.collection.length;m>l;++l){for(b=this.collection.at(l),c=b.get("datetime");c>h;)k+=1,j.push(_.clone(i)),j[k].week=new Date(h),h+=f;d=b.get("Category"),d in j[k]&&(j[k][d]+=1,j[k].Total+=1)}this.order=["confirmed","probable","suspected"];var j=_.map(j.slice(0,-1),function(a){return{vals:[a.Confirmed,a.Probable,a.Suspected],total:a.Total,time:new Date(a.week)}});this.weeks=j,this.drawChart()},drawChart:function(){var a=this.weeks,b=this.$el.width(),c=320>b,d={top:30,right:60,bottom:30,left:60};c&&(d.bottom=60,d.right=34,d.left=34);var e=b-d.left-d.right,f=200-d.top-d.bottom,g=_.map(a,function(a){return a.total}),h=Math.max.apply(null,g),i=Math.floor(e/a.length)-1,j=i/2,k=this.order,l=[];_.each(a,function(a,b){var c=0;a.bars=_.map(a.vals,function(a,b){return{name:k[b],y0:c,y1:c+=a,val:a}}),b%6===0&&l.push({position:b,display:a.time})});var m=d3.scale.linear();m.range([f,0]),m.domain([0,h]);var n=d3.scale.linear().rangeRound([0,e]).domain([0,a.length]),o=d3.svg.axis().scale(m).orient("right"),p=d3.time.format("%d-%m-%Y"),q=_.template("<h4><%= date %></h4><p>Confirmed: <%= confirmed %><br />Probable: <%= probable %><br />Suspected: <%= suspected %>"),r=d3.select("#epi-graph").append("svg").attr("width",e+d.left+d.right).attr("height",f+d.top+d.bottom).append("g").attr("transform","translate("+d.left+","+d.top+")"),s=d3.tip().attr("class","d3-tip").html(function(a){return q({date:p(a.time),confirmed:a.vals[0],probable:a.vals[1],suspected:a.vals[2]})});r.call(s);var t=$("body"),u=!1,v=r.selectAll(".week").data(a).enter().append("g").attr("class","week").attr("transform",function(a,b){return"translate("+(n(b)-j)+",0)"}).on("mouseover",function(a){c||s.show(a)}).on("mouseout",function(){c||s.hide()}).on("click",function(a){c&&(s.show(a),s.isopen=!0,s.justclicked=!0,u&&(window.clearTimeout(u),u=!1),u=window.setTimeout(function(){s.justclicked=!1},50))});t.on("click",function(){!s.justclicked&&s.isopen&&(s.hide(),s.isopen=!1)});var w=(v.selectAll("rect").data(function(a){return a.bars}).enter().append("rect").attr("width",i).attr("y",function(a){return m(a.y1)}).attr("height",function(a){return f-m(a.val)||1}).attr("class",function(a){return a.name}),r.append("g").attr("class","x axis").attr("transform","translate(0,"+(f+3)+")").selectAll(".tick").data(l).enter().append("g").attr("class","tick").attr("transform",function(a){return"translate("+n(a.position)+",0)"}));c?w.append("text").text(function(a){return p(a.display)}).style("text-anchor","end").attr("dy","-.8em").attr("dy",".15em").attr("transform","rotate(-65)"):(w.append("line").attr("x1",0).attr("x2",0).attr("y1",0).attr("y2",5).style("stroke-width","2"),w.append("text").text(function(a){return p(a.display)}).style("text-anchor","middle").attr("dy","15px")),r.append("g").attr("transform","translate("+e+",0)").attr("class","y axis").call(o).append("text").attr("transform","rotate(-90)").attr("y",6).attr("dy","-.8em").style("text-anchor","end").text("Cases");var x=a.length;v.transition().duration(0).delay(function(a,b){return 20*(x-b)}).attr("class","week active")}})}(),WHO.Collections=WHO.Collections||{},function(){"use strict";WHO.Collections.Cases=Backbone.Collection.extend({initialize:function(){this.ref=new Firebase("https://who-ocr-dev.firebaseio.com/cases_aug30")},query:function(){var a=$.proxy(this.onload,this);this.ref.once("value",a)},lastWeek:function(){for(var a,b=this.models.length-1,c=this.at(b).get("datetime")-18144e5,d=[];b>=0;b--){if(a=this.at(b),a.get("datetime")<c)return d;d.push(a.attributes)}return d},onload:function(a){for(var b,c=a.val(),d=Date.parse(new Date),e=Date.parse(new Date("2013","11","20")),f=0,g=c.length;g>f;++f)b=c[f]["Date of notification to WHO"].split("/"),c[f].datetime=Date.parse([b[1],b[0],b[2]].join("/")),c[f].category=c[f].Category.toLowerCase();c=_.filter(c,function(a){return"for aggregates"!==a.category&&!isNaN(a.datetime)&&a.datetime<d&&a.datetime>e}),c=_.sortBy(c,function(a){return a.datetime}),this.reset(c),this.trigger("loaded",c)}})}(),WHO.Collections=WHO.Collections||{},function(){"use strict";WHO.Collections.GlobalRisk=Backbone.Collection.extend({initialize:function(){this.ref=new Firebase("https://luminous-heat-4380.firebaseio.com/response_aug22")},query:function(){var a=$.proxy(this.onload,this);this.ref.once("value",a)},onload:function(a){var b=a.val();this.reset(b),this.trigger("loaded",b)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Deployment=Backbone.Model.extend({url:"",initialize:function(){},defaults:{},validate:function(){},parse:function(a){return a}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Case=Backbone.Model.extend({initialize:function(){},defaults:{}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Country=Backbone.Model.extend({url:"geo/ADM0.topojson",parse:function(a){return topojson.feature(a,a.objects.ADM0)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Province=Backbone.Model.extend({url:"geo/ADM1.topojson",parse:function(a){return topojson.feature(a,a.objects.ADM1)}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.District=Backbone.Model.extend({url:"geo/ADM2.topojson",parse:function(a){return topojson.feature(a,a.objects.ADM2)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Dropdown=Backbone.View.extend({template:_.template($("#dropdown-template").html()),events:{"click a":"select"},initialize:function(a){this.options=a.options,this.selected=this.options[0].display,this.render()},render:function(){this.$el.html(this.template({options:this.options,selected:this.selected})),this.$selected=this.$(".selected"),this.$dropdown=this.$(".dropdown")},select:function(a){return a.preventDefault(),a=a.toElement,this.$selected.text(a.innerHTML),this.$dropdown.toggleClass("open"),WHO.router.set(this.className,a.className),!1}})}(),WHO.Routers=WHO.Routers||{},function(){"use strict";function a(){WHO.getMapType=function(a){return 6>a?"country":7>a?"province":"district"},WHO.models={centroids:new WHO.Models.Centroids,clinics:new WHO.Models.Clinics},WHO.collections={cases:new WHO.Collections.Cases,globalrisk:new WHO.Collections.GlobalRisk},WHO.views={risk:new WHO.Views.Map({el:"#map",id:"map",map:WHO.map,collection:WHO.collections.globalrisk}),casemarkers:new WHO.Views.Marker({el:"#map",id:"map",map:WHO.map,collection:WHO.collections.cases,model:WHO.models.centroids}),epi:new WHO.Views.epiGraph({el:"#epi-graph",id:"epi-graph",collection:WHO.collections.cases}),clinics:new WHO.Views.Clinic({el:"#map",id:"map",map:WHO.map,model:WHO.models.clinics}),legend:new WHO.Views.Legend({el:"#map-legend",id:"map-legend"})};var a=WHO.getMapType(WHO.map.getZoom()),e=[];"country"===a&&(e=["casemarkers","risk","epi","clinics","legend"],WHO.collections.cases.query(),WHO.collections.globalrisk.query(),WHO.models.centroids.fetch(),WHO.models.clinics.query());var f,g=["casemarkers","risk","clinics","all"],h={risk:[0,1,0],cases:[1,0,0],response:[0,1,1],all:[1,1,1]};$("a.layer").on("click",function(a){f=$(this),a.preventDefault();var b=f.data("zoom"),c=WHO.getMapType(b),d=h[f.data("layer")];_.each(d,function(a,b){var d=g[b],f=e.indexOf(d);a&&-1===f?(e.push(d),WHO.views[d].addLayers(c)):a||-1===f||(e.splice(f,1),WHO.views[d].removeLayers())}),WHO.map.closePopup(),WHO.map.setView([8.44,-11.7],b)});var i,j=!1;WHO.map.on("zoomstart",function(){j=!0,window.clearTimeout(i)}),WHO.map.on("zoomend",function(){j=!1,i=window.setTimeout(function(){j||(a=WHO.getMapType(WHO.map.getZoom()),_.each(e,function(b){WHO.views[b].featureChange&&WHO.views[b].featureChange(a)}))},400)}),$("#csv-download-cases").on("click",function(){WHO.collections.cases.length&&b(WHO.collections.cases)}),$("#csv-download-response").on("click",function(){WHO.collections.globalrisk.length&&b(WHO.collections.globalrisk)}),$("#csv-download-facilities").on("click",function(){if("FeatureCollection"===WHO.models.clinics.attributes.type){var a=WHO.models.clinics.attributes.features,b=_.map(a,function(a){return a.properties});c(b)}}),d=!0}function b(a){for(var b=0,c=a.length,d=_.keys(a.at(0).attributes),e=0,f=d.length,g=[],h="data:text/csv;charset=utf-8,"+d.join(",")+"\n",i=[];c>b;e=0,i=[],++b){for(;f>e;i.push(a.at(b).get(d[e])),++e);g.push(i.join(","))}var j=encodeURI(h+g.join("\n"));window.open(j)}function c(a){for(var b=0,c=a.length,d=_.keys(a[0]),e=0,f=d.length,g=[],h="data:text/csv;charset=utf-8,"+d.join(",")+"\n",i=[];c>b;e=0,i=[],++b){for(;f>e;i.push(a[b][d[e]]),++e);g.push(i.join(","))}var j=encodeURI(h+g.join("\n"));window.open(j)}var d=!1;WHO.defaultZoom=5,WHO.map=L.mapbox.map("map","devseed.jcbd85k7").setView([8,-5.7],WHO.defaultZoom),WHO.map.on("viewreset",function(){WHO.map.closePopup()}),WHO.$map=$("#map"),WHO.Routers.App=Backbone.Router.extend({routes:{"":"newload"},newload:function(){a()}}),$(".graph-container").on("click",function(){$(this).hasClass("ui-open")?($(this).animate({bottom:"-180px"}),$(this).removeClass("ui-open"),$(".legend-control span").removeClass("glyphicon-chevron-down"),$(".legend-control span").addClass("glyphicon-chevron-up")):($(this).animate({bottom:"0px"}),$(this).addClass("ui-open"),$(".legend-control span").removeClass("glyphicon-chevron-up"),$(".legend-control span").addClass("glyphicon-chevron-down"))}),$(".legend-control").tooltip()}(),WHO.Views=WHO.Views||{},function(){"use strict";function a(a,b,c,d,e){for(var f=[],g="",h=0,i=d;d>h;f.push("0"),++h);g=f.join("");var j,k=_.keys(a),l={};for(h=0,i=k.length;i>h;++h)k[h]&&(j=k[h].substring(b,c).concat(g),l[j]?_.each(e,function(b){l[j][b]+=a[k[h]][b]}):l[j]=_.clone(a[k[h]]));return l}WHO.Views.Marker=Backbone.View.extend({initialize:function(){this.layers=[],this.popup=new L.Popup({autoPan:!1}),this.maptype=WHO.getMapType(WHO.map.getZoom()),this.listenToOnce(this.collection,"loaded",this.getCases),this.listenToOnce(this.model,"change",this.render)},featureChange:function(a){a!==this.maptype&&(this.maptype=a,this.getCases())},addLayers:function(a){this.maptype=a,this.getCases()},removeLayers:function(){_.each(this.layers,function(a){WHO.map.removeLayer(a)})},getCases:function(){var b,c,d,e,f,g,h={};switch(this.maptype){case"country":c="ADM0_NAME",d="ADM2_CODE";break;case"province":c="ADM1_NAME",d="ADM2_CODE";break;case"district":c="ADM2_NAME",d="ADM2_CODE"}for(var i=0,j=this.collection.models.length;j>i;++i)e=this.collection.models[i],b=e.get("category"),f=e.get(c),g=e.get(d),h[g]||(h[g]={name:f,confirmed:0,probable:0,suspected:0,total:0,hcw:0,deaths:0,recent:0,country:e.get("ADM0_NAME")}),h[g][b]+=1,"Yes"===e.get("HCW")&&(h[g].hcw+=1),"Deceased"===e.get("outcome")&&(h[g].deaths+=1);var k=this.collection.lastWeek();for(i=0,j=k.length;j>i;++i)h[k[i][d]].recent+=1;if("province"===this.maptype||"country"===this.maptype){var l="province"===this.maptype?8:5;h=a(h,0,l,20-l,["confirmed","probable","suspected","total","hcw","deaths","recent"])}var m=0;_.each(h,function(a){a.total=a.confirmed+a.probable+a.suspected,m+=a.total}),$("body").find("button#case-count").empty(),$("body").find("button#case-count").append(this.numberWithCommas(m)+" cases"),this.cases=h,this.render()},render:function(){function a(a){WHO.map.setView(a.latlng,WHO.map.getZoom()+1)}function b(a){if(0==i){var b=a.target;j.setLatLng(a.latlng);var c=h.charAt(0).toUpperCase()+h.slice(1);j.setContent("Country"===c?'<div class="marker-title">'+g[b.feature.id].name+'</div><table class="table-striped"><tr><td class="cases-total-cell"><span class="cases-total">'+g[b.feature.id].total+"</span>Cases</td></tr></table>":'<div class="marker-title">'+g[b.feature.id].name+'</div><div class="location-type">'+c+'</div><div class="country-title">'+g[b.feature.id].country+'</div><table class="table-striped"><tr><td class="cases-total-cell"><span class="cases-total">'+g[b.feature.id].total+"</span>Cases</td></tr></table>"),j._map||j.openOn(WHO.map),window.clearTimeout(f)}}function c(){0==i&&(f=window.setTimeout(function(){WHO.map.closePopup()},100))}function d(a){i=1;var b=a.target,c=g[b.feature.id];j.setLatLng(a.latlng);var d=h.charAt(0).toUpperCase()+h.slice(1);j.setContent("Country"===d?'<div class="marker-title">'+g[b.feature.id].name+'</div><table class="table-striped popup-click"><tr><td>Confirmed cases</td><td class="cell-value">'+c.confirmed+'</td></tr><tr><td>Probable cases</td><td class="cell-value">'+c.probable+'</td></tr><tr><td>Suspected cases</td><td class="cell-value">'+c.suspected+'</td></tr><tr><td>Health Care Workers Affected</td><td class="cell-value">'+c.hcw+'</td></tr><tr><td>Total Deaths</td><td class="cell-value">'+c.deaths+'</td></tr><tr><td>Cases in past 21 days</td><td class="cell-value">'+c.recent+"</td></tr></table>":'<div class="marker-title">'+g[b.feature.id].name+'</div><div class="location-type">'+d+'</div><div class="country-title">'+g[b.feature.id].country+'</div><table class="table-striped popup-click"><tr><td>Confirmed cases</td><td class="cell-value">'+c.confirmed+'</td></tr><tr><td>Probable cases</td><td class="cell-value">'+c.probable+'</td></tr><tr><td>Suspected cases</td><td class="cell-value">'+c.suspected+'</td></tr><tr><td>Health Care Workers Affected</td><td class="cell-value">'+c.hcw+'</td></tr><tr><td>Total Deaths</td><td class="cell-value">'+c.deaths+'</td></tr><tr><td>Cases in past 21 days</td><td class="cell-value">'+c.recent+"</td></tr></table>"),j._map||j.openOn(WHO.map),window.clearTimeout(f)}if(!this.cases||"FeatureCollection"!==this.model.get("type")){var e=$.proxy(this.render,this);return void window.setTimeout(e,100)}this.layers.length&&this.removeLayers();var f,g=this.cases,h=this.maptype,i=0,j=this.popup,k="total",l=_.max(_.map(g,function(a){return a.total})),m=d3.scale.linear().domain([0,l]).range([0,3600]),n={type:"Topology",features:_.chain(this.model.get("features")).filter(function(a){return g[a.id]}).sortBy(function(a){return-g[a.id][k]}).value()},o=.77868852459,p=.5;"country"===h&&(o=1.10655737705,p=.5),WHO.map.on("popupclose",function(){i=0});var q=L.geoJson(n,{pointToLayer:function(a,b){return L.circleMarker(b,{radius:Math.sqrt(m(g[a.id][k])/Math.PI)/o,weight:0,color:"#fff",opacity:p,fillColor:"#B20000",fillOpacity:p})},onEachFeature:function(e,f){f.on({dblclick:a,mousemove:b,mouseout:c,click:d})}}).addTo(WHO.map),r=L.geoJson(n,{pointToLayer:function(a,b){return L.circleMarker(b,{radius:Math.sqrt(m(g[a.id].recent)/Math.PI)/o,weight:1.5,color:"#660000",opacity:.7,fillColor:"#660000",fillOpacity:.7})},filter:function(a){return g[a.id].recent},onEachFeature:function(e,f){f.on({dblclick:a,mousemove:b,mouseout:c,click:d})}}).addTo(WHO.map);q.bringToFront(),r.bringToFront(),this.layers.push(q),this.layers.push(r)},numberWithCommas:function(a){return a.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Centroids=Backbone.Model.extend({url:"geo/centroids.topojson",parse:function(a){return topojson.feature(a,a.objects.centroids)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Legend=Backbone.View.extend({initialize:function(){this.$country=this.$(".country"),this.$district=this.$(".district"),this.$title=this.$("#geography-zoom-level"),this.onLevel="country"},featureChange:function(a){"country"===a&&"country"!==this.onLevel?(this.$country.show(),this.$district.hide(),this.onCountry=!0):"country"!==a&&"country"===this.onLevel&&(this.$country.hide(),this.$district.show(),this.onCountry=!1),this.onLevel!==a&&(this.$title.text(a+"-level response"),this.onLevel=a)}})}(),WHO.Views=WHO.Views||{},function(){"use strict";WHO.Views.Clinic=Backbone.View.extend({initialize:function(){this.listenToOnce(this.model,"loaded",function(){this.featureChange(WHO.getMapType(WHO.map.getZoom()))}),this.layers=[],this.on=!1,this.popup=new L.Popup({autoPan:!1})},featureChange:function(a){"district"!==a||this.on||(this.render(),this.on=!0),"district"!==a&&this.on&&(this.removeLayers(),this.on=!1)},addLayers:function(a){this.featureChange(a)},removeLayers:function(){_.each(this.layers,function(a){WHO.map.removeLayer(a)}),this.on=!1},render:function(){this.layers.length&&this.removeLayers();var a=this.popup,b=this.template,c=L.geoJson(this.model.attributes,{pointToLayer:function(a,b){return"Major Ebola Treatment Centre HUBS"===a.properties.FUNCTION?L.marker(b,{icon:L.icon({iconSize:[32,32],iconUrl:"img/hub-64x64.png"}),opacity:1}):L.marker(b,{icon:L.icon({iconSize:[32,32],iconUrl:"img/triage-64x64.png"}),opacity:1})},onEachFeature:function(c,d){d.on({dblclick:function(a){WHO.map.setView(a.latlng,WHO.map.getZoom()+1)},click:function(c){var d=c.target.feature.properties;_.each(["CITY","LOCATIONS","FUNCTION","Partners","Bed_capacity_current","COUNTRY","Serving_Lab_Location","Status_ECT"],function(a){void 0===d[a]&&(d[a]="N/A")}),a.setLatLng(c.latlng),a.setContent(b(d)),a._map||a.openOn(WHO.map)}})}}).addTo(WHO.map);this.layers.push(c)},template:_.template($("#popup-clinic").html())})}(),WHO.Models=WHO.Models||{},function(){"use strict";WHO.Models.Clinics=Backbone.Model.extend({initialize:function(){this.ref=new Firebase("https://luminous-heat-4380.firebaseio.com/ebolaClinics_aug17")},query:function(){var a=$.proxy(this.onload,this);this.ref.once("value",a)},onload:function(a){var b=a.val();this.set(topojson.feature(b,b.objects.ebolaClinics)),this.trigger("loaded")}})}();