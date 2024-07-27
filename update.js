"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b;
exports.__esModule = true;
exports.initializeTraefik = exports.docker = exports.DYNAMIC_TRAEFIK_PATH = exports.MAIN_TRAEFIK_PATH = exports.BASE_PATH = void 0;
var path = require('node:path');
var fs = require('fs');
var Docker = require('dockerode');
exports.BASE_PATH = "/etc/dokploy";
exports.MAIN_TRAEFIK_PATH = "".concat(exports.BASE_PATH, "/traefik");
exports.DYNAMIC_TRAEFIK_PATH = "".concat(exports.BASE_PATH, "/traefik/dynamic");
exports.docker = new Docker();
var TRAEFIK_SSL_PORT = Number.parseInt((_a = process.env.TRAEFIK_SSL_PORT) !== null && _a !== void 0 ? _a : "", 10) || 443;
var TRAEFIK_PORT = Number.parseInt((_b = process.env.TRAEFIK_PORT) !== null && _b !== void 0 ? _b : "", 10) || 80;
var verifyPaths = function () {
    var paths = [
        path.resolve("".concat(exports.MAIN_TRAEFIK_PATH, "/traefik.yml")),
        path.resolve(exports.DYNAMIC_TRAEFIK_PATH),
        '/var/run/docker.sock'
    ];
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var p = paths_1[_i];
        if (!fs.existsSync(p)) {
            throw new Error("Path does not exist: ".concat(p));
        }
    }
};
var loadAdditionalPorts = function () {
    try {
        var data = fs.readFileSync(path.resolve('./ADDITIONAL_PORTS.json'), 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Failed to load ADDITIONAL_PORTS.json', error);
        return [];
    }
};
var initializeTraefik = function () { return __awaiter(void 0, void 0, void 0, function () {
    var imageName, containerName, basePorts, additionalPorts, settings, service, error_1, createError_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                try {
                    verifyPaths();
                }
                catch (error) {
                    console.error("error verifying paths");
                    process.exit(1);
                }
                imageName = "traefik:v3.0";
                containerName = "dokploy-traefik";
                basePorts = [
                    {
                        TargetPort: 443,
                        PublishedPort: TRAEFIK_SSL_PORT,
                        PublishMode: "host"
                    },
                    {
                        TargetPort: 80,
                        PublishedPort: TRAEFIK_PORT,
                        PublishMode: "host"
                    },
                    {
                        TargetPort: 8080,
                        PublishedPort: 8080,
                        PublishMode: "host"
                    },
                ];
                additionalPorts = loadAdditionalPorts();
                settings = {
                    Name: containerName,
                    TaskTemplate: {
                        ContainerSpec: {
                            Image: imageName,
                            Mounts: [
                                {
                                    Type: "bind",
                                    Source: path.resolve("".concat(exports.MAIN_TRAEFIK_PATH, "/traefik.yml")),
                                    Target: "/etc/traefik/traefik.yml"
                                },
                                {
                                    Type: "bind",
                                    Source: path.resolve(exports.DYNAMIC_TRAEFIK_PATH),
                                    Target: "/etc/dokploy/traefik/dynamic"
                                },
                                {
                                    Type: "bind",
                                    Source: "/var/run/docker.sock",
                                    Target: "/var/run/docker.sock"
                                },
                            ]
                        },
                        Networks: [{ Target: "dokploy-network" }],
                        Placement: {
                            Constraints: ["node.role==manager"]
                        }
                    },
                    Mode: {
                        Replicated: {
                            Replicas: 1
                        }
                    },
                    EndpointSpec: {
                        Ports: __spreadArray(__spreadArray([], basePorts, true), additionalPorts, true)
                    }
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                service = exports.docker.getService(containerName);
                return [4 /*yield*/, service.remove()];
            case 2:
                _a.sent();
                console.log("Existing Traefik service removed \u2705");
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("Failed to remove existing Traefik service:", error_1);
                return [3 /*break*/, 4];
            case 4:
                _a.trys.push([4, 6, , 7]);
                console.log('Creating new Traefik service with settings:', settings);
                return [4 /*yield*/, exports.docker.createService(settings)];
            case 5:
                _a.sent();
                console.log("New Traefik service created and started ✅");
                return [3 /*break*/, 7];
            case 6:
                createError_1 = _a.sent();
                console.error('Failed to create the new Traefik service:', createError_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.initializeTraefik = initializeTraefik;
(0, exports.initializeTraefik)()["catch"](console.error);
