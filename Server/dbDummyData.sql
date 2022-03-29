INSERT INTO public."SNMP_Credentials" VALUES (1, 'pi', 2, 'publicpi');
INSERT INTO public."WMI_Credentials" VALUES(1, 'generic', 'pi', 'blender');
INSERT INTO public."network" VALUES (1, 'default network', 1, 1);
INSERT INTO public."device" VALUES (1, 'localProbe', DEFAULT, 'localhost', '00:00:00:00:00:00', NULL);
INSERT INTO public."user" VALUES(1, 'chris', 'abc', NULL, 1);
INSERT INTO public."scanParameters" VALUES(1, 1, 'Hourly Scan', false, 100, 600000, 2, 2, 0, 10, 10, 0, 1, 0, ARRAY ['10.4.2.50'], ARRAY ['10.4.2.80'], ARRAY [0], ARRAY [1], ARRAY [1]);