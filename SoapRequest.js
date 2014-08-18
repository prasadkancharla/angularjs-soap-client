angular.module('riktam')
    .factory('Soap', ['$http', function ($http) {

        var SoapResponseHandler = function (xmlDoc, errorHandler, scope) {
            xmlDoc = createXmlDocument(xmlDoc);
            //todo: you can modify this response handler to process any generic code for your
            return xmlDoc;
        }

        var createXmlDocument = function (string) {
            var doc;
            if (window.DOMParser) {
                parser = new DOMParser();
                doc = parser.parseFromString(string, "application/xml");
            }
            else {// Internet Explorer
                doc = new ActiveXObject("Microsoft.XMLDOM");
                doc.async = "false";
                doc.loadXML(string);
            }
            return doc;
        }

        var SoapRequest = function (params) {
            var url = params.url,
                data = params.data || {},
                callback = params.success || null,
                scope = params.scope || window,
                errorHandler = params.error || null,
                timeoutHandler = params.timeout || null,
                async = typeof params.async != "undefined" ? params.async : true,
                sync;

            if (typeof sync == "undefined") sync = true;
            if (typeof timeoutHandler == "undefined") timeoutHandler = null;

            var urlArray = url.split("/"),
                method = urlArray.pop();

            url = urlArray.join("/");

            /* Format Soap Request */
            var xmlRequestData = '<?xml version="1.0" encoding="UTF-8"?>' +
                '<soap:Envelope' +
                '  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' +
                '  xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"' +
                '  xmlns:xs="http://www.w3.org/2001/XMLSchema"' +
                '  xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
                '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                '   <soap:Body ' +
                '     soap:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                ' <' + method + '  xmlns="http://tempuri.org/">';
            for (var key in data) {
                if (key != "remove" && key != "indexOf")
                    xmlRequestData += '<' + key + '><![CDATA[' + data[key] + ']]></' + key + '>';
            }
            xmlRequestData += '</' + method + '>' +
                '   </soap:Body>' +
                '</soap:Envelope>';

            var successHandler = function (xhr, headers) {
                if (typeof callback != "undefined" && callback != null) {
                    var response = SoapResponseHandler(xhr, errorHandler, scope);
                    if (response) {
                        callback.call(scope, response);
                    }
                }
            }

            $http({
                url: url,
                dataType: "xml",
                method: "POST",
                data: xmlRequestData,
                headers: {
                    "Content-Type": "text/xml; charset=\"utf-8\""
                }
            }).success(successHandler).error(function (conn) {
                if (typeof timeoutHandler != "undefined" && timeoutHandler != null) {
                    timeoutHandler();
                }
            });
        }

        return {
            request: SoapRequest
        }
    }])



