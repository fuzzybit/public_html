# FuzzyBit CMS Web Client v.Beta

## Introduction

The FuzzyBit CMS is a content management system for building scalable web resources. The CMS features a new binary layout engine which is the keystone to the architecture. The CMS is fully RESTful, built in the MVC design pattern, features an API and a unique and flexible approach to web development.

This is a beta version of the app, it will be open sourced, the license is yet to be applied and all rights are reserved.

## Dependencies

### PHP

This app has been developed on the following versions of PHP:

* 5.3.10, 5.3.29
* 5.3.26, 5.3.29 (cli)

## Instructions

This client-side app has two components and this is the README for the **public** component.

The **public** component is:

* client/
	* images/
	* javascript/
	* styles/
	* .htaccess
	* README.md
	* default.constants.php
	* default.htaccess
	* index.php

This client application has a **private** and a **public** component so downloading and installing it is done in two parts: a **private** and a **public** component.

Install the **public** 'client/' folder in the root of the 'public_html/' folder.

Create a copy of 'default.htaccess' as '.htaccess' and modify it as necessary.

Create a copy of 'javascript/default.constants.js' as 'javascript/constants.js', and edit '[HOST]' to be the project's domain name.

If you already have not done so, proceed to download and install the **private** component above the 'public_html/' folder and make note of the location. Create a copy of 'default.constants.php' as 'constants.php' and edit '[PATH TO PRIVATE]' to be the location of the **private** component.

To complete the installation, go to http://www.fuzzybit.com/registration.php to obtain a secret key and specify an application ID.