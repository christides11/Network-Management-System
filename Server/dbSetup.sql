DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE "user" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "username" varchar,
  "password" varchar,
  "dateCreated" timestamp,
  "networkID" int
);

CREATE TABLE "network" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" varchar,
  "snmpCredentials" int,
  "wmiCredentials" int
);

CREATE TABLE "device" (
  "id" SERIAL PRIMARY KEY NOT NULL,
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
  "id" SERIAL PRIMARY KEY NOT NULL,
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
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nickname" varchar,
  "snmpType" int,
  "communityString" varchar
);

CREATE TABLE "WMI_Credentials" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "nickname" varchar,
  "username" varchar,
  "password" varchar
);

CREATE TABLE "Scan_Results" (
  "scanID" int,
  "id" SERIAL NOT NULL,
  "date" timestamp,
  "devicesFound" jsonb,
  PRIMARY KEY ("scanID", "id")
);

CREATE TABLE "sensor" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" varchar
);

CREATE TABLE "sensordevicedata" (
  "deviceid" int,
  "sensorid" int,
  "id" SERIAL NOT NULL,
  "nickname" varchar,
  "data" jsonb,
  PRIMARY KEY ("deviceid", "sensorid", "id")
);

ALTER TABLE "network" ADD FOREIGN KEY ("snmpCredentials") REFERENCES "SNMP_Credentials" ("id");

ALTER TABLE "network" ADD FOREIGN KEY ("wmiCredentials") REFERENCES "WMI_Credentials" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("parent") REFERENCES "device" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("snmpCredentials") REFERENCES "SNMP_Credentials" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("wmiCredentials") REFERENCES "WMI_Credentials" ("id");

ALTER TABLE "scanParameters" ADD FOREIGN KEY ("probeID") REFERENCES "device" ("id");

ALTER TABLE "scanParameters" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

ALTER TABLE "sensordevicedata" ADD FOREIGN KEY ("sensorid") REFERENCES "sensor" ("id");

ALTER TABLE "sensordevicedata" ADD FOREIGN KEY ("deviceid") REFERENCES "device" ("id");

ALTER TABLE "Scan_Results" ADD FOREIGN KEY ("scanID") REFERENCES "scanParameters" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

