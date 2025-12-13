import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface LabProgress {
  id: string;
  phase_number: number;
  phase_name: string;
  task_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  notes: string;
  started_at: string | null;
  completed_at: string | null;
}

const phases = [
  {
    number: 1,
    name: 'Foundation',
    tasks: [
      'Install KVM stack',
      'Create virtual networks',
      'Deploy pfSense firewall',
      'Test internet connectivity',
      'Verify internal network isolation'
    ]
  },
  {
    number: 2,
    name: 'SIEM Deployment',
    tasks: [
      'Deploy Ubuntu Server VM',
      'Install Elasticsearch + Kibana',
      'Configure Fleet Server',
      'Set up data retention policies',
      'Create basic dashboards'
    ]
  },
  {
    number: 3,
    name: 'Attack Platform',
    tasks: [
      'Deploy Kali Linux VM',
      'Update all tools',
      'Test network connectivity',
      'Run basic reconnaissance against pfSense',
      'Verify network segmentation'
    ]
  },
  {
    number: 4,
    name: 'Infrastructure Validation',
    tasks: [
      'Run extended Elastic log ingestion tests',
      'Configure pfSense log forwarding to Elastic',
      'Set up Suricata IDS on pfSense',
      'Create basic detection dashboards',
      'Document baseline performance metrics'
    ]
  },
  {
    number: 5,
    name: 'Windows Infrastructure',
    tasks: [
      'Download Windows Server 2022 ISO',
      'Deploy Windows Server VM',
      'Promote to Domain Controller',
      'Configure AD DS and DNS',
      'Create user accounts and OUs',
      'Install Sysmon and Elastic Agent'
    ]
  },
  {
    number: 6,
    name: 'Endpoints & Attack Simulation',
    tasks: [
      'Download Windows 10/11 ISO',
      'Deploy Windows client VM',
      'Join to domain',
      'Install Sysmon',
      'Deploy Elastic Agent',
      'Run attack simulation scenarios'
    ]
  }
];

export default function SOCLabTracker() {
  const [progress, setProgress] = useState<LabProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const { data, error } = await supabase
      .from('soc_lab_progress')
      .select('*')
      .order('phase_number', { ascending: true })
      .order('created_at', { ascending: true });

    if (!error && data) {
      setProgress(data);
    }
    setLoading(false);
  };

  const initializeProgress = async () => {
    const tasks = phases.flatMap(phase =>
      phase.tasks.map(task => ({
        phase_number: phase.number,
        phase_name: phase.name,
        task_name: task,
        status: 'pending' as const,
        notes: ''
      }))
    );

    const { error } = await supabase
      .from('soc_lab_progress')
      .insert(tasks);

    if (!error) {
      loadProgress();
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() };

    if (status === 'in_progress' && !progress.find(p => p.id === taskId)?.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('soc_lab_progress')
      .update(updates)
      .eq('id', taskId);

    if (!error) {
      loadProgress();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseProgress = (phaseNumber: number) => {
    const phaseTasks = progress.filter(p => p.phase_number === phaseNumber);
    const completed = phaseTasks.filter(p => p.status === 'completed').length;
    return phaseTasks.length > 0 ? (completed / phaseTasks.length) * 100 : 0;
  };

  if (loading) {
    return <div className="text-center py-8">Loading lab progress...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4">SOC Lab Build Progress</h2>
        <p className="text-gray-300 mb-6">
          Tracking my journey building a complete Security Operations Center lab environment
        </p>

        {progress.length === 0 && (
          <button
            onClick={initializeProgress}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
          >
            Initialize Progress Tracking
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {phases.map(phase => {
          const phaseProgress = getPhaseProgress(phase.number);
          const phaseTasks = progress.filter(p => p.phase_number === phase.number);
          const isExpanded = selectedPhase === phase.number;

          return (
            <div key={phase.number} className="bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedPhase(isExpanded ? null : phase.number)}
                className="w-full p-6 text-left hover:bg-gray-750 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">
                    Phase {phase.number}: {phase.name}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {Math.round(phaseProgress)}% complete
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
              </button>

              {isExpanded && phaseTasks.length > 0 && (
                <div className="px-6 pb-6 space-y-3">
                  {phaseTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-900 rounded">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                      <span className="flex-1">{task.task_name}</span>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Lab Specifications</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Hardware</p>
            <p>Dell XPS 9320</p>
            <p>16GB RAM, 16 cores</p>
          </div>
          <div>
            <p className="text-gray-400">Hypervisor</p>
            <p>KVM with VT-x</p>
          </div>
          <div>
            <p className="text-gray-400">VMs</p>
            <p>pfSense, Elastic SIEM, Windows DC, Windows Client, Kali Linux</p>
          </div>
          <div>
            <p className="text-gray-400">Network</p>
            <p>10.10.10.0/24 isolated lab network</p>
          </div>
        </div>
      </div>
    </div>
  );
}
