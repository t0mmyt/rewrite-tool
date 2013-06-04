Magic is done by the script cgi-bin/ajax.pl, interface is provided by the html file and a load of
javascript under js/core.js and css under css/core.css.  Eveything else is standard jQuery and jQuery-ui.

Dir containing DBs must be writable by Apache user.

domains.conf in the webroot contains a hash of Map Names (I've gone with the convention of the site as a 
name) and the location of the DB.

Auth is your responsibility, at present the script doesn't handle it.


Sample vhost for the tool:
==========================

<VirtualHost *:80>
    ServerName	stg-rewrites.lncms.websys.tmcs

    DocumentRoot	/app/shared/htdocs/rewrites
    DirectoryIndex	index.html

    <Location />
	AuthType	Basic
	AuthName	"LNCMS Rewrites Configuration"
	AuthUserFile	/app/shared/htdocs/rewrites/.htpasswd
	Require		valid-user
    </Location>

    <Directory /app/shared/htdocs/rewrites/cgi-bin>
	Options         +ExecCGI
	AddHandler      cgi-script .pl
    </Directory>
</VirtualHost>

Sample vhost additions for a site using the rewrites:
=====================================================

    RewriteEngine	On

    # This is the rewrite magic using external SDBM files
    RewriteMap	rwmap dbm=sdbm:/app/shared/conf/conf.d/rewrites/downloadfestival.co.uk
    RewriteCond	${rwmap:%{REQUEST_URI}}	.
    RewriteRule	^.* ${rwmap:%{REQUEST_URI}} [R=301,L]
    # And the magic ends

