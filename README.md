Welcome to the hydrogen wiki! This is a work in progress and will be constantly updated. Below you will find pages to this wiki but also feel free to view some nice features and information about the package.

## Pages
* [Home](https://github.com/element-ts/hydrogen/wiki/Home)
* [Examples](https://github.com/element-ts/hydrogen/wiki/Example)
* [Creating an Endpoint](https://github.com/element-ts/hydrogen/wiki/Endpoint)
* [Understanding Requests](https://github.com/element-ts/hydrogen/wiki/Requests)
* [Understanding Responses](https://github.com/element-ts/hydrogen/wiki/Responses)
* [Dealing with Files](https://github.com/element-ts/hydrogen/wiki/Files)
* [Enforcing Types](https://github.com/element-ts/hydrogen/wiki/Types)
* [Endpoint Groups](https://github.com/element-ts/hydrogen/wiki/Groups)
* [Creating a Server](https://github.com/element-ts/hydrogen/wiki/Server)
* [Using `HObject`](https://github.com/element-ts/hydrogen/wiki/HObject)
* [Error Handling](https://github.com/element-ts/hydrogen/wiki/Error)
* [Dynamic Endpoints](https://github.com/element-ts/hydrogen/wiki/Dynamic)
* [Post Process Handler](https://github.com/element-ts/hydrogen/wiki/PostProcessHandler)

## Example
```typescript
import {HEndpointGroup, HHTTPServer, HRequest, HResponse} from "@element-ts/hydrogen";
import {OStandardType} from "@element-ts/oxygen";

const rootEndpoint: HEndpointGroup = new HEndpointGroup();
const userEndpoint: HEndpointGroup = new HEndpointGroup();

userEndpoint.post("/sign-up", {
    handler: async(req: HRequest, res: HResponse): Promise<void> => {

	const body: {name: string, age: number} = req.getBody();
	res.send({id: "xxx", name: body.name});

    },
    types: {
	name: OStandardType.STRING,
	age: OStandardType.NUMBER
    }
});

// below is an equivalent way of adding an endpoint using the HEndpointBuilder
userEndpoint.add(HEndpointBuilder
    .post("hello")
    .listener(async(req: HRequest, res: HResponse): Promise<void> => {
        const body: {name: string, age: number} = req.getBody();
        res.send({id: "xxx", name: body.name});
    })
    .types({
        name: OStandardType.STRING,
        age: OStandardType.NUMBER
    })
);

rootEndpoint.get("/hello", async(req: HRequest, res: HResponse) => {
    res.sendFile("/path-to-file");
});

rootEndpoint.attach("/user", userEndpoint);

new HHTTPServer(rootEndpoint).start(3000);
```

## Features

### Runtime Type Checking
This project uses [@element-ts/oxygen](https://github.com/element-ts/oxygen) which is a runtime type checker a part of
the [element-ts](https://element-ts.com) family. By defining types in your endpoint hydrogen will automatically parse
the body of the response and verify that the types match, if they do not match and error will be returned and your
handler will not even be called!

### Errors
All errors are handled with hydrogen if you use an `HError` or
`err(code?: HErrorStatusCode, msg?: string, show: boolean = true): void` it will be handled. You can also throw errors
in a handler and hydrogen will handle them for you. If they are of type `HError` then errors codes and messages can be
send to your client, if not, a `500 - Internal Server Error` will be sent.

### Coders
Requests and responses are automatically encoded and decoded for you however you still have the option to send raw
`Buffer` objects through the TCP socket that is open with your client.

### File Managers
You can send files or streams to your client but you can also receive file uploads from your client. To do this all you
have to do is define a `upload` object on your endpoint you can limit things like mime, size, and where you want the
file.

### Low Level yet High Level
You can handle everything down on the binary level if you like by using the `write(b: Buffer)` and `writeEnd()` methods
on `HResponse` but you also have helper methods like `res.send(o: object)`, `res.sendFile(path: string)`,
`res.sendString(s: string)` and many many more. They are just sugar on top as everything ends up calling `write()`
and `writeEnd()`

### Modular
I use this package with another package of mine called
[@element-ts/silicon](https://www.npmjs.com/package/@element-ts/silicon) which is a package for communicating with
MongoDB databases. It is very easy to use and I built it to *sort of* replicate what
[Parse](https://parseplatform.org/) used to be. In hydrogen I provide an interface called `HObject` that requires just
one method with the signature `bond(): object`. On `HResponse` you can use `sendHObject(obj: HObject)` and it will take
the object you provide and then use the object returned by `bond()` and send it using `res.send()`. This is helpful if
you have properties that you may not want to send to the client all the time yet still provide a super fast way to send
an object to your client.

### Protocols
Everything revolves around `HEndpointGroup` objects. Once you have created an endpoint group you can either instantiate
a `HHTTPServer` or `HHTTPSServer` (*forgive me on the names lol*). When you create a new server you must pass in an
endpoint group to be used as the root endpoint group of your server. If you want an HTTPS server, simply use an
`HHTTPSServer`, you will also have to pass in a key and certificate with the signature:
`new HHTTPSServer(endpointGroup: HEndpointGroup, key: Buffer, cert: Buffer)` and *voila* you have HTTPS instead
of :shit:y ol' HTTP.

## About

### Language
All of hydrogen is written in [TypeScript](https://www.typescriptlang.org). If you do not know how to use TypeScript
don't worry. It is completely compatible with JavaScript.

### Why?
I started this package to use in all my different projects. This is sort of a V2 to a package I wrote in 2018. I took
everything I learned from the original package and used it. I named it hydrogen because I think element names are cool
and hydrogen is kind of a building block for different bonds.

### Author/Maintainer
My name is [Elijah Cobb](https://elijahcobb.com). I am a computer science student at
[Michigan Technological University](https://mtu.edu). I have worked for a few start ups, one right out of high school.
I am now the back-end developer for a few small projects and so this package is sort of the base of all my projects.
When I need a feature I add it to this package.