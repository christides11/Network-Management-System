CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY,
  "username" varchar,
  "password" varchar,
  "dateCreated" timestamp,
  "networkID" int
);

CREATE TABLE "network" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "numDevices" int,
  "deviceName" varchar,
  "snmpCredentials" int,
  "wmiCredentials" int
);

CREATE TABLE "device" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar,
  "dateAdded" timestamp,
  "ipAddress" varchar,
  "macAddress" varchar,
  "parent" int,
  "networkID" int,
  "snmpCredentials" int,
  "wmiCredentials" int
);

CREATE TABLE "scanParameters" (
  "id" SERIAL PRIMARY KEY,
  "networkID" int,
  "name" varchar,
  "allowICMPResponders" bool,
  "snmpTimeout" float,
  "scanTimeout" float,
  "snmpRetries" int,
  "wmiRetries" int,
  "hopCount" int,
  "discoveryTimeout" int,
  "nextScanTime" int,
  "timeBetweenScans" int,
  "probeID" int,
  "scanType" int,
  "ipStartRange" varchar[],
  "ipEndRange" varchar[],
  "subnet" varchar[],
  "snmpCredentials" int[],
  "wmiCredentials" int[]
);

CREATE TABLE "SNMP_Credentials" (
  "id" SERIAL PRIMARY KEY,
  "nickname" varchar,
  "snmpType" int,
  "communityString" varchar
);

CREATE TABLE "WMI_Credentials" (
  "id" SERIAL PRIMARY KEY,
  "nickname" varchar,
  "username" varchar,
  "password" varchar
);

CREATE TABLE "Scan_Results" (
  "scanID" int,
  "date" timestamp,
  "devicesFound" varchar[]
);

ALTER TABLE "network" ADD FOREIGN KEY ("snmpCredentials") REFERENCES "SNMP_Credentials" ("id");

ALTER TABLE "network" ADD FOREIGN KEY ("wmiCredentials") REFERENCES "WMI_Credentials" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("parent") REFERENCES "device" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("snmpCredentials") REFERENCES "SNMP_Credentials" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("wmiCredentials") REFERENCES "WMI_Credentials" ("id");

ALTER TABLE "scanParameters" ADD FOREIGN KEY ("probeID") REFERENCES "device" ("id");

ALTER TABLE "scanParameters" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

ALTER TABLE "Scan_Results" ADD FOREIGN KEY ("scanID") REFERENCES "scanParameters" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");
