"use strict";

var text_string;
d3.text("data/csv/v2/green-green", function(text) {
	var data = d3.csv.parseRows(text);
	text_string = data[0][0];
	drawWordCloud(text_string);

	function drawWordCloud(text_string) {
		var common = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";
		var word_count = {};
		var words = text_string.split(" ");
		if (words.length == 1) {
			word_count[words[0]] = 1;
		} else {
			words.forEach(function(word) {
				var word = word.toLowerCase();
				if (word != "" && common.indexOf(word) == -1 && word.length > 1) {
					if (word_count[word]) {
						word_count[word]++;
					} else {
						word_count[word] = 1;
					}
				}
			})
		}
		var svg_location = "#vis2";
		var width = 860;
		var height = 600;
		var fill = d3.scale.category20();
		var word_entries = d3.entries(word_count);
		var xScale = d3.scale.linear()
			.domain([0, d3.max(word_entries, function(d) {
				return d.value;
			})])
			.range([10, 100]);
		d3.layout.cloud().size([width, height])
			.timeInterval(20)
			.words(word_entries)
			.fontSize(function(d) {
				return xScale(+d.value);
			})
			.text(function(d) {
				return d.key;
			})
			.rotate(function() {
				return ~~(Math.random() * 2) * 90;
			})
			.font("Impact")
			.on("end", draw)
			.start();

		function draw(words) {
			d3.select(svg_location).append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
				.selectAll("text")
				.data(words)
				.enter().append("text")
				.style("font-size", function(d) {
					return xScale(d.value) + "px";
				})
				.style("font-family", "Impact")
				.style("fill", function(d, i) {
					return fill(i);
				})
				.attr("text-anchor", "middle")
				.attr("transform", function(d) {
					return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
				.text(function(d) {
					return d.key;
				})
				.on("mouseover", function(d) {
					d3.select(this)
						.transition().duration(200)
						.style("font-weight", "bold")
				})
				.on("mouseout", function(d) {
					d3.select(this)
						.transition().duration(500)
						.style("font-weight", null)
				});
				$(svg_location + ' svg g text').tipsy({ 
					gravity: 'w', 
					html: true, 
					title: function() {
					var d = this.__data__;
						return d.key; 
					}
				});
		}
		d3.layout.cloud().stop();
	}
	d3.selectAll("#opts_v2")
		.on('change', function() {
			var ID = d3.select(this).property('value');
			if (ID == "Carjacking") {
				update_wordcloud("data/csv/v2/carjacking");
			} else if (ID == "NaturalDisaster") {
				update_wordcloud("data/csv/v2/natural_disaster")
			} else if (ID == "DownedAircraft") {
				update_wordcloud("data/csv/v2/downed_aircraft")
			} else if (ID == "Arrest") {
				update_wordcloud("data/csv/v2/arrest")
			} else if (ID == "GreenGreen") {
				update_wordcloud("data/csv/v2/green-green")
			} else if (ID == "Refugees") {
				update_wordcloud("data/csv/v2/refugees")
			} else if (ID == "Murder") {
				update_wordcloud("data/csv/v2/murder")
			} else if (ID == "Assassination") {
				update_wordcloud("data/csv/v2/assassination")
			} else if (ID == "Demonstration") {
				update_wordcloud("data/csv/v2/demonstration")
			}
		})

	function update_wordcloud(filename) {
		d3.text(filename, function(text) {
			var data = d3.csv.parseRows(text);
			text_string = data[0][0];
			drawWordCloud2(text_string);

			function drawWordCloud2(text_string) {
				var common = "poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";
				var word_count = {};
				var words = text_string.split(" ");
				if (words.length == 1) {
					word_count[words[0]] = 1;
				} else {
					words.forEach(function(word) {
						var word = word.toLowerCase();
						if (word != "" && common.indexOf(word) == -1 && word.length > 1) {
							if (word_count[word]) {
								word_count[word]++;
							} else {
								word_count[word] = 1;
							}
						}
					})
				}
				var svg_location = "#vis2";
				var width = 860;
				var height = 600;
				var fill = d3.scale.category20();
				var word_entries = d3.entries(word_count);
				var xScale = d3.scale.linear()
					.domain([0, d3.max(word_entries, function(d) {
						return d.value;
					})])
					.range([10, 100]);
				d3.layout.cloud().size([width, height])
					.timeInterval(20)
					.words(word_entries)
					.fontSize(function(d) {
						return xScale(+d.value);
					})
					.text(function(d) {
						return d.key;
					})
					.rotate(function() {
						return ~~(Math.random() * 2) * 90;
					})
					.font("Impact")
					.on("end", draw)
					.start();

				function draw(words) {
					d3.select(svg_location)
						.attr("width", width)
						.attr("height", height)
						.attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
						.selectAll("text")
						.data(words)
						.transition().duration(500).ease("elastic")
						.style("font-size", function(d) {
							return xScale(d.value) + "px";
						})
						.style("font-family", "Impact")
						.style("fill", function(d, i) {
							return fill(i);
						})
						.attr("text-anchor", "middle")
						.attr("transform", function(d) {
							return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
						})
						.text(function(d) {
							return d.key;
						});						
						$(svg_location + ' svg g text').tipsy({ 
							gravity: 'w', 
							html: true, 
							title: function() {
							var d = this.__data__;
								return d.key; 
							}
						});
				}
				d3.layout.cloud().stop();
			}
		});
	}
});
