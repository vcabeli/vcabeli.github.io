// From http://mkweb.bcgsc.ca/circos/guide/tables/
// and http://exposedata.com/tutorial/chord/latest.html


//Nom des categories sur le graph actuellement
var catnames = 	 
    [	"Romance",
	"Computers",
	"Internet",
	"Sarcasm",
	"Math",
	"Language",
	"Statistics",
	"Wikipedia",
	"Cueball",
	"Megan",
	"Beret Guy",
    ];

var matrix = buildMatrix(catnames);
var real_numbers = getRealNumbers(catnames);


var chord = d3.layout.chord()
    .padding(.03)
    .sortSubgroups(d3.ascending)
//matrice "d'adjacence" chaque case est le nombre de comics de la categorie ligne 
//qui est aussi dans la categorie colonne. La diagonale est le nombre de 
//comics qui ne se trouve dans aucune autre categorie.
    .matrix(matrix);

//largeur et hauteur du svg
var w = 1000,
    h = 1000,
// diametre du cercle
    r0 = Math.min(w, h) * .35,
// diametre des arcs de cercle des categories 
    r1 = r0 * 1.1;


var arc_svg = d3.svg.arc().innerRadius(r0).outerRadius(r1)
var chord_svg = d3.svg.chord().radius(r0);

// les cordes ont la couleur du groupe source
var coloring = 'source';

var comp = {
    source:  function(a, b) { return a.value >= b.value ? a : b },
    target: function(a, b) { return a.value < b.value ? a : b }
};

var chords_sort = d3.ascending;


// couleurs
var fill = d3.scale.category20c();

// Cree l'objet chart
var svg = d3.select("#chart")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
    .attr("id", "circle");

// cercle de zone d'inaction de la souris
svg.append("circle")
    .attr("r", r1);

// Cree les arcs de cercle a l'exterieur
g = svg.append("svg:g")
    .attr("class", "groups")
    .selectAll("path")
// recupere les infos de la matrice d'adjacence
    .data(chord.groups);

g.enter().append("svg:path")
    .attr("class", "arc")
// colorie selon l'index du group (avec fonction fill)
    .style("fill", function(d) { return fill(d.index); })
    .style("stroke", function(d) { return d3.rgb(fill(d.index)).darker(); })
// coordonnees de l'arc de cercle: r0 -> r1
    .attr("d", d3.svg.arc().innerRadius(r0).outerRadius(r1))
// evenements quand on passe la souris dessus
    .on("mouseover", mouseover)
    .on("click", function(d) { removeIndex(d.index) })
    .append("title")
    .text(function(d) { return catnames[d.index] + " is in " + d.value + " comics on this graph (" + real_numbers[d.index] + " real)"; })

g.enter().append("svg:text")
// calcule angle, position...
    .attr("class", "label")
    .each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
	.attr("dy", ".35em")
    .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
    .attr("transform", function(d) {
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + (r0 + 40) + ")"
            + (d.angle > Math.PI ? "rotate(180)" : "");
    })
    .style("font-size","15px")
    .text(function(d) { return catnames[d.index]; });


var chord2 = svg.selectAll(".chord")
    .data(chord.chords)

// Ajoute les branches ("chord")
chord2.enter().append("path")
    .attr("class", "chord")
    .style("fill", function(d) { return  fill(d.source.index); })
    .attr("d", d3.svg.chord().radius(r0))
    .style("fill-opacity", 0.8)
    .append("title")
    .text(function(d) { return "There are " + d.source.value + " comics about " + catnames[d.source.index] + " and "  + (d.source.index != d.target.index ? (catnames[d.target.index]) : "nothing else on this graph."); });



function flipColors() {
    coloring = coloring == 'source' ? 'target' : 'source';
    svg.selectAll(".chord")
	.transition()
        .duration(500)
        .style("fill", function(d) { return fill(comp[coloring](d.source, d.target).index)});
};


function sortChords() {
    chords_sort = chords_sort == d3.ascending ? d3.descending : d3.ascending;

    var old = {
        groups: chord.groups(),
        chords: chord.chords()
    };

    chord.sortSubgroups(chords_sort)

    svg.selectAll(".chord")
	.data(chord.chords)
        .transition()
        .duration(1500)
        .style("fill", function(d) { return fill(comp[coloring](d.source, d.target).index); })
        .attrTween("d", chordTween(chord_svg, old));
};


function addCategory(catName) {

    if ((catnames.indexOf(catName) != -1) || (data["catnames"].indexOf(catName) == -1)) {
	return false;
    }

    var old = {
        groups: chord.groups(),
        chords: chord.chords()
    };


    catnames.unshift(catName);
    index = data["catnames"].indexOf(catName);
    real_numbers.unshift(data["real_numbers"][index]);
    diag = countAlone(catnames);

    matrix = buildMatrix(catnames)

    chord = d3.layout.chord()
	.padding(.03)
	.sortSubgroups(d3.ascending)
	.matrix(matrix)

    g = svg.selectAll(".groups")
	.selectAll("path")
    // recupere les infos de la matrice d'adjacence
	.data(chord.groups);

    g.enter().append("svg:path")
	.filter(function(d) { return d.index==(catnames.length-1)})
	.attr("class", "arc")
    // colorie selon l'index du group (avec fonction fill)
	.style("fill", function(d) { return fill(d.index); })
	.style("stroke", function(d) { return d3.rgb(fill(d.index)).darker(); })
    // coordonnees de l'arc de cercle: r0 -> r1
	.attr("d", d3.svg.arc().innerRadius(r0).outerRadius(r1))
    // evenements quand on passe la souris dessus
	.on("mouseover", mouseover)
	.on("click", function(d) { removeIndex(d.index) })
	.append("title")
	.text(function(d) { return catnames[d.index] + " is in " + d.value + " comics on this graph (" + real_numbers[d.index] + " real)"; })


    g.enter().append("svg:text")
    // calcule angle, position...
	.filter(function(d) { return d.index==(catnames.length-1)})
	.attr("class", "label")
	.each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
	    .attr("dy", ".35em")
	.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
	.attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + (r0 + 40) + ")"
		+ (d.angle > Math.PI ? "rotate(180)" : "");
	})
	.style("font-size","15px")
	.text(function(d) { return catnames[d.index]; });


    svg.selectAll(".arc")
        .data(chord.groups)
	.on("mouseover", mouseover)
	.on("click", function(d) { removeIndex(d.index) })
        .transition()
        .duration(1500)
	.style("fill", function(d) {return fill(d.index)})
	.style("stroke", function(d) { return d3.rgb(fill(d.index)).darker(); })
	.attr("d", d3.svg.arc().innerRadius(r0).outerRadius(r1))
        .select("title")
	.text(function(d) { return catnames[d.index] + " is in " + d.value + " comics on this graph (" + real_numbers[d.index] + " real)"; })
	

    chord2.remove()

    setTimeout( function() {

	chord2 = svg.selectAll(".chord")
	    .data(chord.chords)
	
	// Ajoute les branches ("chord")
	chord2.enter().append("path")
	    .attr("class", "chord")
	    .style("opacity", 0)
	    .style("fill", function(d) { return  fill(d.source.index); })
	    .attr("d", d3.svg.chord().radius(r0))
	    .append("title")
	    .text(function(d) { return "There are " + d.source.value + " comics about " + catnames[d.source.index] + " and "  + (d.source.index != d.target.index ? (catnames[d.target.index]) : "nothing else on this graph."); });


	svg.selectAll(".chord")
	    .transition()
	    .duration(500)
	    .style("opacity", 0.8)},
		
		1100);


    svg.selectAll(".label")
	.data(chord.groups)
	.transition()
	.duration(1500)
	.each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
	    .attr("dy", ".35em")
	.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
	.attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + (r0 + 40) + ")"
		+ (d.angle > Math.PI ? "rotate(180)" : "");
	})
	.text(function(d) { return catnames[d.index]; });

    return true;
};


function removeIndex(index) {
    var old = {
        groups: chord.groups(),
        chords: chord.chords()
    };

    matrix = chord.matrix()

    catnames.splice(index, 1);
    real_numbers.splice(index, 1);
    diag = countAlone(catnames);

    matrix.splice(index, 1);

    for (var i = 0; i < matrix.length; i++) {
        var row = matrix[i];
	row.splice(index, 1);
	row[i] = diag[i];
    }


    chord = d3.layout.chord()
	.padding(.03)
	.sortSubgroups(d3.ascending)
	.matrix(matrix)


    chord2.remove()

    svg.selectAll(".arc")
	.filter(function(d) { return d.index == index; })
	.remove()


    svg.selectAll(".arc")
        .data(chord.groups)
	.on("mouseover", mouseover)
	.on("click", function(d) { removeIndex(d.index) })
        .transition()
        .duration(1500)
	.style("fill", function(d) {return fill(d.index)})
	.style("stroke", function(d) { return d3.rgb(fill(d.index)).darker(); })
	.attr("d", d3.svg.arc().innerRadius(r0).outerRadius(r1))
        .select("title")
	.text(function(d) { return catnames[d.index] + " is in " + d.value + " comics on this graph (" + real_numbers[d.index] + " real)"; })



    setTimeout( function() {

	chord2 = svg.selectAll(".chord")
	    .data(chord.chords)
	
	// Ajoute les branches ("chord")
	chord2.enter().append("path")
	    .attr("class", "chord")
	    .style("opacity", 0)
	    .style("fill", function(d) { return  fill(d.source.index); })
	    .attr("d", d3.svg.chord().radius(r0))
	    .append("title")
	    .text(function(d) { return "There are " + d.source.value + " comics about " + catnames[d.source.index] + " and "  + (d.source.index != d.target.index ? (catnames[d.target.index]) : "nothing else on this graph."); });

	svg.selectAll(".chord")
	    .transition()
	    .duration(500)
	    .style("opacity", 0.8)},
		
		1100);


    svg.selectAll(".label")
	.filter( function(d) { return d.index == index})
	.remove()


    svg.selectAll(".label")
	.data(chord.groups)
	.transition()
	.duration(1500)
	.each(function(d) { d.angle = (d.startAngle + d.endAngle) / 2; })
	    .attr("dy", ".35em")
	.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
	.attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + (r0 + 40) + ")"
		+ (d.angle > Math.PI ? "rotate(180)" : "");
	})

};

/** Returns an event handler for fading a given chord group. */
function mouseover(d, i) {
    chord2.classed("fade", function(d) {
	return d.source.index != i
            && d.target.index != i;
    });
};


function chordTween(chord_svg, old) {
    return function(d,i) {
        var i = d3.interpolate(old.chords[i], d);

        return function(t) {
            return chord_svg(i(t));
        }
    }
};



// Interpolate the arcs
function arcTween(arc_svg, old) {
    return function(d,i) {
        var i = d3.interpolate(old.groups[i], d);
        return function(t) {
            return arc_svg(i(t));
        }
    }
};


function countAlone(catnames) {

    var diag = []
    for (var i = 0; i < catnames.length; i++) {

	var index = data["catnames"].indexOf(catnames[i]);
	var seen_in_cat = new Array(csv[index].length);
	var seen_in_others = new Array(csv[index].length);
	for (var t=0; t < csv[index].length; t++) {
	    seen_in_others[t] = false;
	    seen_in_cat[t] = false;
	}
	var tot_cat = 0;

	for (var j = 0; j < catnames.length; j++) {
	    var index2 = data["catnames"].indexOf(catnames[j]);
	    if (j != i) {
		for (var k = 0; k < csv[index2].length; k++) {
		    seen_in_others[k] = (seen_in_others[k] || (csv[index2][k] == 1));
		}
	    }
	    else {
		for (var k = 0; k < csv[index2].length; k++) {
		    seen_in_cat[k] = (csv[index2][k] == 1);
		    if (seen_in_cat[k]) {
			tot_cat ++;
		    }
		}
	    }
	}
	
	count = 0;
	for(var t=0; t<csv[index].length; t++) {
	    if (seen_in_cat[t] && seen_in_others[t]) {
		count ++;
	    }
	}
	diag.push(tot_cat - count);
    }
    
    return diag;
};


function buildMatrix(catnames) {

    var adj = new Array(catnames.length);
    var diag = countAlone(catnames);

    for (var i = 0; i < catnames.length; i++) {

	var index = data["catnames"].indexOf(catnames[i]);
	adj[i] = new Array(catnames.length);

	for (var j = 0; j < catnames.length; j++) {
	    var index2 = data["catnames"].indexOf(catnames[j]);
	    adj[i][j] = data["matrix"][index][index2]
	}
	adj[i][i] = diag[i];
    }

    return adj;
};


function getRealNumbers(catnames) {

    diag = [];
    for (var i=0; i < catnames.length; i++) {
	var index = data["catnames"].indexOf(catnames[i]);
	diag.push(data["real_numbers"][index])
    }

    return diag;
};


function clearChords() {

    catnames = []
    matrix = buildMatrix(catnames);
    real_numbers = getRealNumbers(catnames);


    chord = d3.layout.chord()
	.padding(.03)
	.sortSubgroups(d3.ascending)
    //matrice "d'adjacence" chaque case est le nombre de comics de la categorie ligne 
    //qui est aussi dans la categorie colonne. La diagonale est le nombre de 
    //comics qui ne se trouve dans aucune autre categorie.
	.matrix(matrix);
	
};
