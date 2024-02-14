# Ebay Finding Service

The code in this folder include a [SOAP definitions file](./ebayFindingService.wsdl) and a client that is generated using
[wsdl-tsclient](https://www.npmjs.com/package/wsdl-tsclient).

To regenerate the client follow these steps:

1. install `wsdl-tsclient` globally with `npm i -g wsdl-tsclient`
2. delete the `ebayFindingService` with `rm -rf ebayFindingService`
3. generate the code with `wsdl-tsclient ./ebayFindingService.wsdl -o . && mv ebayfindingService ebayFindingService`
