# SOC Lab Plan - ChatGPT

## System Specs (from screenshot)

### CPU
- 16 logical CPUs (0–15)
- Likely 6-core/12-thread or 8-core/16-thread Intel CPU (XPS 9320 with Intel 12th or 13th gen)
- VT-x virtualization supported ✅
- L1d cache: 448 KB (12 instances)
- L1i cache: 640 KB (12 instances)
- L2 cache: 9 MB (6 instances)
- L3 cache: 18 MB (1 instance)

### Memory (RAM)
- Total RAM: ~15.4 GB
- Used: 1.4 GB
- Free: 8.9 GB
- Available: 13 GB
- Swap: 2.0 GB (unused)
- **Effective: 16 GB RAM**

## What This Means for Your SOC Lab

You have more than enough for a full home SOC lab.

### You CAN comfortably run:
- Kali Linux VM
- Windows 10/11 VM (for attacker/target)
- Ubuntu Server VM running:
  - Elastic Stack (Elasticsearch + Kibana + Logstash)
  - LimaCharlie / Wazuh / OpenCTI
- A pfSense/OPNsense firewall VM
- A Windows domain controller (Server 2019/2022)

With 16 GB RAM, you can run 3–4 VMs at once with reasonable performance.

## Recommended VM RAM Allocation

| VM | Recommended RAM |
|---|---|
| Kali Linux | 2–3 GB |
| Windows 10/11 | 4–6 GB |
| Ubuntu Security Server (Elastic / Wazuh) | 4 GB |
| pfSense | 1 GB |
| Windows Server (Domain Controller) | 4 GB |

Your 16 GB machine can handle this if you don't run everything at once — run 2–3 VMs simultaneously.

## VMs You Will Run

### 1️⃣ pfSense Firewall
**Purpose:** Router + IDS/IPS + Firewall logs

**Specs:**
- CPU: 1 core
- RAM: 1 GB
- Disk: 10 GB
- NIC1: NAT (WAN)
- NIC2: Internal (LAN)

### 2️⃣ Ubuntu Security Server (Elastic + Fleet + Sysmon ingestion)
**Purpose:**
- Host Elastic Stack (Elasticsearch + Kibana)
- Host Fleet (endpoint manager)
- Collect Windows logs (Sysmon + Event Logs)

**Specs:**
- CPU: 4 cores
- RAM: 4–6 GB
- Disk: 60 GB
- NIC: Internal network

This will be your core SIEM.

### 3️⃣ Windows Server 2019/2022 (Domain Controller)
**Purpose:**
- Active Directory
- DNS
- Produce AD logs (authentication, policy changes)

**Specs:**
- CPU: 2 cores
- RAM: 3–4 GB
- Disk: 50 GB
- NIC: Internal

### 4️⃣ Windows 10/11 Client
**Purpose:**
- Simulated victim
- Runs Sysmon
- Generates alerts
- Joins your AD Domain

**Specs:**
- CPU: 2 cores
- RAM: 3 GB
- Disk: 40 GB
- NIC: Internal

### 5️⃣ Kali Linux (Attack Box)
**Purpose:**
- Attack your Windows client
- Generate real attack logs
- Tools: Nmap, Metasploit, Hydra, etc.

**Specs:**
- CPU: 1–2 cores
- RAM: 2 GB
- Disk: 30 GB
- NIC: Internal

## Total Resource Usage on Your 16 GB Laptop

| VM | RAM (GB) |
|---|---|
| pfSense | 1 |
| Elastic | 4–6 |
| Windows DC | 3–4 |
| Windows Client | 3 |
| Kali | 2 |
| **Total** | **13–16 GB** |

You'll normally run Elastic + DC + Windows Client + Kali.
You can suspend Kali or the DC if needed.

Your system can handle this.

## STEP 1: Install KVM + Required Tools

Run this in your terminal:

```bash
sudo apt update
sudo apt install -y qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils virt-manager
```

Enable and start libvirt:

```bash
sudo systemctl enable --now libvirtd
```

Confirm KVM is active:

```bash
lsmod | grep kvm
```

If you see `kvm_intel` → You're good.

## STEP 2: Create Your Virtual Networks

You will create two networks:

### 1️⃣ NAT Network (default)
- Used for pfSense WAN
- KVM already gives you: virbr0 (NAT → internet)

### 2️⃣ Internal SOC Network (Custom)
- All SOC VMs go here for logging & attacks

Create it:

```bash
sudo virsh net-define /usr/share/libvirt/networks/default.xml
```

Or in virt-manager:
- Edit → Connection Details → Virtual Networks
- Add Network
- Name: socnet
- Forwarding: Isolated network (NO external access)
- DHCP: ON
- Subnet: 10.10.10.0/24

## STEP 3: Create Each VM (KVM Specs)

Your hypervisor now supports all the features we need:
virtio disks, virtio NICs, bridged networking, CPU passthrough.

### 1️⃣ pfSense VM
**Purpose:** Router + IDS/IPS

**KVM Settings:**
- CPU: host-passthrough, 1 vCPU
- RAM: 1 GB
- Disk: 10 GB (virtio)
- NIC 1: virbr0 (NAT) → WAN
- NIC 2: socnet (internal) → LAN
- Boot: ISO

### 2️⃣ Elastic Stack SOC Server (Ubuntu Server 22.04)
**Purpose:** SIEM + dashboards + ingestion

**Specs:**
- CPU: 4 vCPU
- RAM: 4–6 GB
- Disk: 60 GB (SSD strongly recommended)
- NIC: socnet
- Notes: Use virtio for disk + NIC

### 3️⃣ Windows Server (Domain Controller)
**Specs:**
- CPU: 2 vCPU
- RAM: 3–4 GB
- Disk: 50 GB
- NIC: socnet

**Services:**
- Active Directory
- DNS
- Sysmon
- Winlogbeat/Fleet Agent

### 4️⃣ Windows 10/11 Client
**Specs:**
- CPU: 2 vCPU
- RAM: 3 GB
- Disk: 40 GB
- NIC: socnet

**Notes:**
- Join to the domain
- Install Sysmon
- Install Elastic agent

### 5️⃣ Kali Linux
**Specs:**
- CPU: 1–2 vCPU
- RAM: 2 GB
- Disk: 30 GB
- NIC: socnet

**Tools:**
- nmap
- metasploit
- responder
- smbclient
- evil-winrm
- kerbrute / impacket

This gives you:
- Attack box
- Victim Windows box
- Domain controller
- SIEM
- Firewall
- A full SOC chain with real-world logs.

## Network Topology

```
Internet
    │
    ├─[NAT/virbr0]──► pfSense WAN (vtnet0)
                           │
                           └─[socnet/10.10.10.0/24]──► pfSense LAN (vtnet1)
                                                              │
                                                              ├─► Elastic Server (10.10.10.10)
                                                              ├─► Windows DC (10.10.10.20)
                                                              ├─► Windows Client (10.10.10.30)
                                                              └─► Kali Linux (10.10.10.40)
```
