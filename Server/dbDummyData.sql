INSERT INTO public."SNMP_Credentials" VALUES (DEFAULT, 'pi', 2, 'publicpi');
INSERT INTO public."WMI_Credentials" VALUES(DEFAULT, 'generic', 'pi', 'blender');
INSERT INTO public."network" VALUES (DEFAULT, 'default network', 1, 1);
INSERT INTO public."device" VALUES (DEFAULT, 'localProbe', DEFAULT, 'localhost', '00:00:00:00:00:00', NULL);
INSERT INTO public."user" VALUES(DEFAULT, 'chris', 'abc', NULL, 1);
INSERT INTO public."scanParameters" VALUES(DEFAULT, 1, 'One Time Scan', false, 100, 600000, 2, 2, 0, 10, 10, 0, 1, 0, ARRAY ['10.4.2.50'], ARRAY ['10.4.3.0'], ARRAY [0], ARRAY [1], ARRAY [1]);