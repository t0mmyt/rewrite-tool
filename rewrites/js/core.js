/*
################################################################################
#
# js/core.js
#
################################################################################
#
# 2013, Tom Taylor <tom.taylor@ticketmaster.co.uk>
#
# This is the js file that provides most of the functionality.  All of the rest
# of the javascript (currently) in use is unmodified jQuery/jQuery-ui.
#
# This script has some very ugly parts, javascript is not a pleasant language to
# look at.
# 
# This code needs a lot of cleaning up!
#
# 2013-06-03	TT. Initial commit to SVN.  
#
################################################################################


*/
var domains;

function clean_domain(this_domain) {
    return this_domain.replace(/\./g,'_');
}

function html_new_rewrite(this_domain) {
    var this_clean_domain=clean_domain(this_domain);
    return "<fieldset id='fld_new'>\
    <legend>New Rewrite</legend>\
    <table id='new_entry'>\
    <tr>\
	<th class='col_key'><label for='key'>Key</label></th>\
	<th class='col_value'><label for='val'>Value</label></th>\
	<th>Actions</th>\
    </tr>\
    <tr class='odd'>\
	<td class='col_key'>\
	    <input type='text' id='key_input_" +this_clean_domain+ "' class='colkey' name='key' size='20' />\
	</td>\
	<td class='col_value'>\
	    <input type='text' id='val_input_" +this_clean_domain+ "' class='colval' name='val' size='20' />\
	</td>\
	<td>\
	<button onclick='updateItem(\"" +this_domain+ "\")'>Add / Update</button>\
    </td>\
    </tr>\
    </table>\
    </fieldset>";
    return output;
}

function getDomains() {
    var results = [];
    $.ajax({
	url:	'cgi-bin/ajax.pl?action=listdomains',
	dataType:'json',
	async:	false,
	success: function( data ) {
	    if (data.error) {
		alert(data.error);
	    }
	    else {
		results = data.domains;
	    }
	}
    });
    return results;
}

function populateTabs() {
    for (var i in domains) {
	var this_domain = clean_domain(domains[i]);
	var domain_tabs = $("#domain_tabs").tabs();
	var ul = domain_tabs.find("ul")
	$("<li><a href='#" +this_domain+ "'>" +domains[i]+ "</a></li>").appendTo(ul);
	var some_html = "<div id='" +this_domain+ "'>";
	some_html += "<div id='nw_" +this_domain+ "'>" +html_new_rewrite(domains[i])+ "</div>";
	some_html += "<div id='cw_" +this_domain+ "'></div></div>";
	$(some_html).appendTo(domain_tabs);
	reloadList(domains[i]);
    }
    $("#domain_tabs").tabs('refresh');
    $("#domain_tabs").tabs("option", "active", 0);
}

function reloadList(this_domain) {
    var this_clean_domain = clean_domain(this_domain);
    $.ajax({
	url:	'cgi-bin/ajax.pl',
	data:	{
	    action:	'list',
	    domain:	this_domain
	},
	dataType:'json',
	success: function( data ) {
	    var curr_list = data.results;
	    var table = "<fieldset><legend>Current Rewrites</legend><table id='current_list'><tr><th class='col_key'>Key</th><th class='col_value'>Value</th><th>Actions</th></tr>\n";
	    for (var i in curr_list) {
		if ((i % 2) == 0) {
		    myclass = 'odd';
		}
		else {
		    myclass = 'even';
		}
		table += "<tr class='" +myclass+ "'>";
		table += "<td id='key_" +this_clean_domain+ "_" +i+ "'>" + curr_list[i][0] + "</td>";
		table += "<td id='val_" +this_clean_domain+ "_" +i+ "'>" + curr_list[i][1] + "</td>";
		table += "<td><button onclick=\"editThis('" +this_clean_domain+"_"+i+ "')\"'>Edit</button>";
		table += "<button onclick=\"deleteThis('" +this_clean_domain+"_"+i+ "', '" +this_domain+ "')\"'>Delete</button></td></tr>";
	    }
	    table += '</table></fieldset>';
	    $("#cw_" +clean_domain(this_domain)).html(table);
	}
    });
}

function updateItem(this_domain) {
    var this_clean_domain = clean_domain(this_domain);
    $.ajax({
	url:	"cgi-bin/ajax.pl",
	type:	"get",
	data:	{
	    action:	"update", 
	    key:	$("#key_input_" + this_clean_domain).val(),
	    value:	$("#val_input_" + this_clean_domain).val(),
	    domain:	this_domain,
	},
	success:setTimeout(function(){reloadList(this_domain)},500),
    });
}

function deleteThis( i, this_domain ) {
    $.ajax({
	url:	"cgi-bin/ajax.pl",
	type:	"get",
	data:	{
	    action:	"delete", 
	    key:	$("#key_" + i).html(),
	    domain:	this_domain,
	},
	success:setTimeout(function(){reloadList(this_domain)},500),
    });
}

function editThis( i ) {
    $("#key_input_" +i.substr(0, i.length-2)).val($("#key_" + i).html())
    $("#val_input_" +i.substr(0, i.length-2)).val($("#val_" + i).html())
    window.scrollTo(0,0);
}

$(document).ready(function() {
    domains = getDomains();
    populateTabs();
});

