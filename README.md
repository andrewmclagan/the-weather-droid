# the-weather-droid

A simple node.js twitter weather bot with minimal dependencies.

* **Stack** Node.js
* **Testing** Jasmine 2
* **Package Management** NPM
* **Deployment** Forge provisioner
* **Devops** Linode cloud platform

### The Solution

A NodeJS stck was choosen as most appropriate for a simple application that consumes an external API and impliments a socket like connection. Other technologies such as PHP, RUBY and Python would require much more code to leverage the same, simple abilities. 

The bot basically consumes the Twitter v1.1 API, socket streaming direct messages (to user `@TheWeatherDroid`) and parsing the content through some basic reg-ex functions. There is a very basic/loose natural language algorithm that responds to requests for weather data in plain english. Temperature is determined as "relative temperature" via a **Heat Index** algorithem https://en.wikipedia.org/wiki/Heat_index.

See Roadmap for more information.

### Installation

The application has very minimal dependencies and requirements aside from a typical NodeJS stack.

1. Simply clone this repository.
2. Install the dependencies via `npm install`
3. Run the bot via `node app`

### Deployment

On such a small project its difficult to demonstrate proper deployment practices. In reality I would implement CI (continuous Integration) and automated test suites for solid health checks.

Currently deploying on **Linode Cloud Infrastructure** via **Forge** provisioning and deployment service. 

### Roadmap

**0.1.0**
* [x] Determine relative temperature via a **Heat Index** algorithem https://en.wikipedia.org/wiki/Heat_index
* [x] Basic natural language responses
* [x] Socket streaming of messages directed to bot
* [x] basic unit test coverage

**0.2.0**
* [ ] Write more unit tests (Jasmine v2.0.1)
* [ ] Abstract natural language algorithm into separate package
* [ ] Refactor natural language algorithms to better predict input
* [ ] Better test coverage
* [ ] Implement Continuous Integration with TravisCI

**0.3.0**
* [ ] Better Error handling 
* [ ] Multiple weather sources
* TBA...

**NOTE** be aware that any push to `master` will trigger a deployment on the production server.

### Design Patterns & Concepts

As the applications requirements were very basic there are few software design patterns that apply to the use-case. Despite that the following were applied, if very weakly.

* Semantic versioning
* Service Provider Pattern
* Dependency Inversion Pattern (weakly)
* Basic SOLID principles

### Tools Used

* Git (source control)
* NPM (package management)
* Forge (cloud provisioner and deployments)

### Stack & Dependencies

* NodeJS 
* Jasmine 2 (unit tests)
* Twitter API library
* lodash
* Javascript EMCA 6

### Time 

Developed in ~1.5hrs




