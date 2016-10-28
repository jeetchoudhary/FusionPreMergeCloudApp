/**
 * Created by jitender choudhary on 10/28/2016.
 */
 
Steps to generate public key for the transactin history:
1. from the host : "ssh-keygen -t rsa" and accept all default values
2. "cat ~/.ssh/id_rsa.pub | ssh jjikumar@slc05gsa.us.oracle.com "mkdir -p ~/.ssh && cat >>  ~/.ssh/authorized_keys"" 