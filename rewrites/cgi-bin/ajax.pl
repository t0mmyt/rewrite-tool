#!/usr/bin/perl -w
################################################################################
#
# cgi-bin/ajax.pl
#
################################################################################
#
# 2013, Tom Taylor <tom.taylor@ticketmaster.co.uk>
#
# This is the perl script that backs the rewrite tool.
#
# Output is *ALWAYS* JSON.  s/die/error_me/ (don't non-zero, just send an error
# message to the client).
#
# TODO:
#  - File locking on the DBM file, this is not as straight forward as and flock
#    before the tie as first block will be cached even when the file is locked.
#
#  - Comments before I forget what the code does
#
#  - Get rid of badly named variables like $i
#
#  - maybe write a json_me() for dumping objects instead of print qq({})
#
#
# 2013-06-03	TT. Initial SVN commit
#
################################################################################
use strict;

use SDBM_File;
use Fcntl;
use CGI;

use vars qw/%rewrites %domains $main_domain/;

my $config_file = "/app/shared/htdocs/rewrites/domains.conf";

sub error_me($) {
    my $error = shift;
    $error =~ s/"/\"/g;
    print qq({ "error" : "$error" });
    exit;
}

open CONF, "<$config_file" or error_me "Couldn't open config file domains.conf\n";
while (<CONF>) {
    if (/^([\w\-\.]+)\s+(.*)$/) {
	$domains{$1} = $2;
    }
}
close CONF;

my $q = new CGI;
print $q->header('application/json');

my $action = $q->param('action');
my $domain = $q->param('domain');
my $key = $q->param('key');
my $value = $q->param('value');

error_me "No action defined" unless defined $action;

if ($action eq 'listdomains') {
    print qq({ "domains" : [);
    {
	my $delim = '';
	for (keys %domains) {
	    print qq($delim\n\t"$_");
	    $delim = ',';
	}
    }
    print "\n]}\n";
}
elsif ($action eq 'list' && defined $domain) {
    tie( %rewrites, 'SDBM_File', $domains{$domain}, O_RDWR|O_CREAT, 0664 ) or error_me $!;
    print qq({ "results" : [);
    {
	my $delim = '';
	for (keys %rewrites) {
	    print qq($delim\n\t["$_", "$rewrites{$_}"]);
	    $delim = ',';
	}
    }
    print "\n]}\n";
    untie %rewrites;
}
elsif ($action eq 'update' && defined $domain) {
    tie( %rewrites, 'SDBM_File', $domains{$domain}, O_RDWR|O_CREAT, 0664 );
    if (length($key) > 0 && length($value) > 0) {
	$rewrites{$key} = $value;
	print "$key -> $value\n";
    }
    else {
	error_me "Domain, key and value needed for update!";
    }
    untie %rewrites;
}
elsif ($action eq 'delete' && defined $domain) {
    tie( %rewrites, 'SDBM_File', $domains{$domain}, O_RDWR|O_CREAT, 0664 );
    if ( length($key) > 0 && exists $rewrites{$key} ) {
	delete $rewrites{$key};
    }
    else {
	error_me "Domain and key needed for delete!";
    }
    untie %rewrites;
}
else {
    error_me "Action or Domain not specified";
}
