DECLARE
 l_return_status VARCHAR2(100);
 l_msg_count     NUMBER;
 l_msg_data      VARCHAR2(2000);
 BEGIN
 ASK_TOPOLOGY_MANAGER.DEPLOY_ENTERPRISE_APPLICATION (
 p_enterprise_app_short_name => 'ORA_FSCM_UIAPP'
 , p_deployed_host => 'indl76040.in.oracle.com'
 , p_deployed_port => '7011'
 , p_environment_short_name => NULL
 , x_return_status => l_return_status
 , x_msg_count => l_msg_count
 , x_msg_data => l_msg_data  );
 
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
 DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
 DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data); 
 END IF;
 
 ASK_TOPOLOGY_MANAGER.DEPLOY_ENTERPRISE_APPLICATION (
 p_enterprise_app_short_name => 'ORA_FSCM_SERVICESAPP'
 , p_deployed_host => 'indl76040.in.oracle.com'
 , p_deployed_port => '7011'
 , p_environment_short_name => NULL
 , x_return_status => l_return_status
 , x_msg_count => l_msg_count
 , x_msg_data => l_msg_data  );
 
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
 DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
 DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data); 
 END IF;
 ASK_TOPOLOGY_MANAGER.DEPLOY_ENTERPRISE_APPLICATION (
 p_enterprise_app_short_name => 'ORA_FSCM_ESSAPP'
 , p_deployed_host => 'indl76040.in.oracle.com'
 , p_deployed_port => '7011'
 , p_environment_short_name => NULL
 , x_return_status => l_return_status
 , x_msg_count => l_msg_count
 , x_msg_data => l_msg_data  );
 
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
 DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
 DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data); 
 END IF;
 
 
 ASK_TOPOLOGY_MANAGER.populate_end_point (
   logical_module_short_name =>  'ORA_FSCM_SERVICE'
 , deployed_protocol =>  'http'
 , deployed_host =>  'indl76040.in.oracle.com'
 , deployed_port =>  '7011'
 , deployed_context_root =>  null
 , deployed_module_name =>  null
 , environment_short_name =>  null
 , x_return_status =>  l_return_status
 , x_msg_count =>  l_msg_count
 , x_msg_data =>  l_msg_data
 );
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
   DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
   DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data);
 END IF;
 ASK_TOPOLOGY_MANAGER.populate_end_point (
   logical_module_short_name =>  'ORA_FSCM_UI'
 , deployed_protocol =>  'http'
 , deployed_host =>  'indl76040.in.oracle.com'
 , deployed_port =>  '7011'
 , deployed_context_root =>  null
 , deployed_module_name =>  null
 , environment_short_name =>  null
 , x_return_status =>  l_return_status
 , x_msg_count =>  l_msg_count
 , x_msg_data =>  l_msg_data
 );
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
   DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
   DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data);
 END IF;
 ASK_TOPOLOGY_MANAGER.populate_end_point (
   logical_module_short_name =>  'ORA_FSCM_ANALYTICS'
 , deployed_protocol =>  'http'
 , deployed_host =>  'indl76040.in.oracle.com'
 , deployed_port =>  '7011'
 , deployed_context_root =>  null
 , deployed_module_name =>  null
 , environment_short_name =>  null
 , x_return_status =>  l_return_status
 , x_msg_count =>  l_msg_count
 , x_msg_data =>  l_msg_data
 );
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
   DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
   DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data);
 END IF;
 ASK_TOPOLOGY_MANAGER.populate_end_point (
   logical_module_short_name =>  'ORA_FSCM_REST'
 , deployed_protocol =>  'http'
 , deployed_host =>  'indl76040.in.oracle.com'
 , deployed_port =>  '7011'
 , deployed_context_root =>  null
 , deployed_module_name =>  null
 , environment_short_name =>  null
 , x_return_status =>  l_return_status
 , x_msg_count =>  l_msg_count
 , x_msg_data =>  l_msg_data
 );
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
   DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
   DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data);
 END IF;
 ASK_TOPOLOGY_MANAGER.populate_end_point (
   logical_module_short_name =>  'ORA_FSCM_SEARCH'
 , deployed_protocol =>  'http'
 , deployed_host =>  'indl76040.in.oracle.com'
 , deployed_port =>  '7011'
 , deployed_context_root =>  null
 , deployed_module_name =>  null
 , environment_short_name =>  null
 , x_return_status =>  l_return_status
 , x_msg_count =>  l_msg_count
 , x_msg_data =>  l_msg_data
 );
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
   DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
   DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data);
 END IF;
 END;
 /
 
 
 
 
 
 
 
 
 ##jitu Endpoints
 ASK_TOPOLOGY_MANAGER.DEPLOY_ENTERPRISE_APPLICATION (
 p_enterprise_app_short_name => 'ORA_FA_SOAAPP'
 , p_deployed_host => 'indl76040.in.oracle.com'
 , p_deployed_port => '7011'
 , p_environment_short_name => NULL
 , x_return_status => l_return_status
 , x_msg_count => l_msg_count
 , x_msg_data => l_msg_data  );
 
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
 DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
 DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data); 
 END IF;
 
 ASK_TOPOLOGY_MANAGER.DEPLOY_ENTERPRISE_APPLICATION (
 p_enterprise_app_short_name => 'ORA_FA_WSMAPP'
 , p_deployed_host => 'indl76040.in.oracle.com'
 , p_deployed_port => '7011'
 , p_environment_short_name => NULL
 , x_return_status => l_return_status
 , x_msg_count => l_msg_count
 , x_msg_data => l_msg_data  );
 
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
 DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
 DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data); 
 END IF;
 
 ASK_TOPOLOGY_MANAGER.populate_end_point (
   logical_module_short_name =>  'ORA_FASOAINTEGRATION'
 , deployed_protocol =>  'http'
 , deployed_host =>  'indl76040.in.oracle.com'
 , deployed_port =>  '7011'
 , deployed_context_root =>  null
 , deployed_module_name =>  null
 , environment_short_name =>  null
 , x_return_status =>  l_return_status
 , x_msg_count =>  l_msg_count
 , x_msg_data =>  l_msg_data
 );
 IF (l_return_status = ASK_TOPOLOGY_MANAGER.G_RET_STS_SUCCESS) THEN
   DBMS_OUTPUT.PUT_LINE('SUCCESS: ' || l_msg_data);
 ELSE
   DBMS_OUTPUT.PUT_LINE('ERROR: ' || l_msg_data);
 END IF;
 