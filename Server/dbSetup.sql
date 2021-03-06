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
  "wmiCredentials" int,
  "status" int,
  "statusmessage" varchar
);

CREATE TABLE "scanParameters" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "networkID" int,
  "name" varchar,
  "allowICMPResponders" bool,
  "snmpTimeout" float,
  "pingTimeout" float,
  "snmpRetries" int,
  "wmiRetries" int,
  "hopCount" int,
  "discoveryTimeout" int,
  "scanfrequencytype" int,
  "nextscantime" timestamp,
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
  "name" varchar,
  "description" varchar
);

CREATE TABLE "sensorchannel" (
  "sensor_id" int,
  "id" SERIAL NOT NULL,
  "name" varchar,
  PRIMARY KEY ("sensor_id", "id")
);

CREATE TABLE "statustype" (
  "id" int PRIMARY KEY NOT NULL,
  "name" varchar
);

CREATE TABLE "devicesensor" (
  "device_id" int,
  "sensor_id" int,
  "id" SERIAL NOT NULL,
  "name" varchar,
  "tags" varchar[],
  "status" int,
  "statusmessage" varchar,
  "settings" jsonb,
  "nexttime" timestamp NOT NULL,
  PRIMARY KEY ("device_id", "sensor_id", "id")
);

CREATE TABLE "devicesensorchanneldata" (
  "device_id" int,
  "sensor_id" int,
  "devicesensor_id" int,
  "channel_id" int,
  "collected_at" timestamp,
  "data" int[],
  PRIMARY KEY ("device_id", "sensor_id", "devicesensor_id", "channel_id", "collected_at")
);

ALTER TABLE "network" ADD FOREIGN KEY ("snmpCredentials") REFERENCES "SNMP_Credentials" ("id");

ALTER TABLE "network" ADD FOREIGN KEY ("wmiCredentials") REFERENCES "WMI_Credentials" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("parent") REFERENCES "device" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("snmpCredentials") REFERENCES "SNMP_Credentials" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("wmiCredentials") REFERENCES "WMI_Credentials" ("id");

ALTER TABLE "device" ADD FOREIGN KEY ("status") REFERENCES "statustype" ("id");

ALTER TABLE "scanParameters" ADD FOREIGN KEY ("probeID") REFERENCES "device" ("id");

ALTER TABLE "scanParameters" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

ALTER TABLE "devicesensor" ADD FOREIGN KEY ("sensor_id") REFERENCES "sensor" ("id");

ALTER TABLE "devicesensor" ADD FOREIGN KEY ("device_id") REFERENCES "device" ("id");

ALTER TABLE "devicesensor" ADD FOREIGN KEY ("status") REFERENCES "statustype" ("id");

ALTER TABLE "sensorchannel" ADD FOREIGN KEY ("sensor_id") REFERENCES "sensor" ("id");

ALTER TABLE "devicesensorchanneldata" ADD FOREIGN KEY ("device_id", "sensor_id", "devicesensor_id") REFERENCES "devicesensor" ("device_id", "sensor_id", "id");

ALTER TABLE "devicesensorchanneldata" ADD FOREIGN KEY ("sensor_id", "channel_id") REFERENCES "sensorchannel" ("sensor_id", "id");

ALTER TABLE "Scan_Results" ADD FOREIGN KEY ("scanID") REFERENCES "scanParameters" ("id");

ALTER TABLE "user" ADD FOREIGN KEY ("networkID") REFERENCES "network" ("id");

INSERT INTO public."statustype" VALUES (1, 'Unknown');
INSERT INTO public."statustype" VALUES (2, 'Up');
INSERT INTO public."statustype" VALUES (3, 'Warning');
INSERT INTO public."statustype" VALUES (4, 'Down');
INSERT INTO public."network" VALUES (DEFAULT, 'network one', NULL, NULL);
INSERT INTO public."device" VALUES (DEFAULT, 'localProbe', DEFAULT, 'localhost', '00:00:00:00:00:00', NULL, 1, NULL, NULL, 2);
INSERT INTO public."sensor" VALUES (1, 'Ping', 'Sends an ICMP request from the probe to the device to monitor its availability.');
INSERT INTO public."sensor" VALUES (2, 'SNMP Traffic', 'Monitors network traffic on a device using SNMP.');

INSERT INTO public."sensorchannel" VALUES (1, -4, 'Downtime');
INSERT INTO public."sensorchannel" VALUES (1, 0, 'Ping Time');
INSERT INTO public."sensorchannel" VALUES (1, 1, 'Minimum');
INSERT INTO public."sensorchannel" VALUES (1, 2, 'Maximum');
INSERT INTO public."sensorchannel" VALUES (1, 3, 'Packet Loss');

INSERT INTO public."sensorchannel" VALUES (2, -4, 'Downtime');
INSERT INTO public."sensorchannel" VALUES (2, -1, 'Total Traffic (Bytes)');
INSERT INTO public."sensorchannel" VALUES (2, 0, 'Traffic Incoming (Bytes)');
INSERT INTO public."sensorchannel" VALUES (2, 1, 'Traffic Outgoing (Bytes)');