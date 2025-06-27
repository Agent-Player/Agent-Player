export interface SystemInfo {
  timestamp: string;
  cpu: {
    physical_cores: number;
    total_cores: number;
    frequencies: {
      max: number;
      min: number;
      current: number;
    };
    usage: {
      total: number;
      per_core: number[];
    };
  };
  memory: {
    virtual: {
      total: number;
      available: number;
      used: number;
      percentage: number;
    };
    swap: {
      total: number;
      free: number;
      used: number;
      percentage: number;
    };
  };
  disk: Array<{
    device: string;
    mountpoint: string;
    filesystem: string;
    total_size: number;
    used: number;
    free: number;
    percentage: number;
  }>;
  network: {
    interfaces: Array<{
      name: string;
      addresses: Array<{
        family: string;
        address: string;
      }>;
    }>;
    io: {
      bytes_sent: number;
      bytes_received: number;
    };
  };
  processes: {
    total: number;
    running: number;
    sleeping: number;
    stopped: number;
    zombie: number;
    top_processes: Array<{
      pid: number;
      name: string;
      cpu_usage: number;
      memory_usage: number;
      status: string;
      created: string;
    }>;
  };
  boot_time: string;
  users: Array<{
    name: string;
    terminal: string | null;
    host: string | null;
    started: string;
  }>;
}

export interface SystemMonitorProps {
  className?: string;
  refreshInterval?: number; // in milliseconds, default 5000
  showLoadingState?: boolean;
}

export interface SystemMetricsCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

export interface MetricProps {
  label: string;
  value: string | number | React.ReactNode;
  unit?: string;
  status?: "success" | "warning" | "error" | "info";
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface NetworkConnection {
  process_name: string;
  status: string;
  local_addr: string;
  remote_addr: string | null;
  pid: number;
}

interface NetworkData {
  interfaces: {
    name: string;
    addresses: {
      family: string;
      address: string;
      netmask: string | null;
      broadcast: string | null;
    }[];
  }[];
  connections: NetworkConnection[];
  io: {
    bytes_sent: number;
    bytes_received: number;
    packets_sent: number;
    packets_received: number;
    bytes_sent_formatted: string;
    bytes_received_formatted: string;
  };
}

export interface SystemMetricsData {
  timestamp: string;
  cpu: {
    physical_cores: number;
    total_cores: number;
    frequencies: {
      max: number;
      min: number;
      current: number;
    };
    usage: {
      total: number;
      per_core: number[];
    };
  };
  memory: {
    virtual: {
      total: number;
      available: number;
      used: number;
      percentage: number;
      total_formatted: string;
      available_formatted: string;
      used_formatted: string;
    };
    swap: {
      total: number;
      free: number;
      used: number;
      percentage: number;
      total_formatted: string;
      free_formatted: string;
      used_formatted: string;
    };
  };
  disk: {
    device: string;
    mountpoint: string;
    filesystem: string;
    total_size: number;
    used: number;
    free: number;
    percentage: number;
    total_formatted: string;
    used_formatted: string;
    free_formatted: string;
  }[];
  network: NetworkData;
  processes: {
    total: number;
    running: number;
    sleeping: number;
    stopped: number;
    zombie: number;
  };
}

export interface SystemData {
  network: {
    connections: NetworkConnection[];
  };
}

export interface ServicePort {
  port: string;
  status: "running" | "stopped" | "not_detected";
}
