// MIT. Retention for the existing opt-in native chooser trace.
using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

internal sealed class NativeTrace : IDisposable {
  private const string Folder = "dsh-ai-exporter-native-debug-v1";
  private const string Header = "dsh-ai-exporter/native-debug/v1 ";
  private readonly RetentionHandle temp, root, file;

  private NativeTrace(RetentionHandle temp, RetentionHandle root, RetentionHandle file) {
    this.temp=temp; this.root=root; this.file=file;
  }

  // Node and Win32 pick different variables when TEMP and TMP are both set.
  private static string TraceParent() {
    return Environment.GetEnvironmentVariable("DSH_EXPORTER_TRACE_TEMP") ?? Path.GetTempPath();
  }

  public static NativeTrace Start() {
    if (Environment.GetEnvironmentVariable("DSH_EXPORTER_NATIVE_DEBUG")!="1") return null;
    RetentionHandle temp=null,root=null,file=null;
    try {
      temp=RetentionHandle.OpenDirectory(TraceParent());
      root=temp.CreateDirectory(Folder);
      string id=Guid.NewGuid().ToString("N");
      file=root.CreateFile("trace-"+id+".log");
      file.Write(Encoding.UTF8.GetBytes(Header+id+"\n"),false);
      return new NativeTrace(temp,root,file);
    } catch {
      if(file!=null)file.Dispose(); if(root!=null)root.Dispose(); if(temp!=null)temp.Dispose();
      return null;
    }
  }

  public void Phase(string phase) {
    try { file.Write(Encoding.UTF8.GetBytes(phase+"\n"),false); } catch { /* opt-in tracing is best effort */ }
  }

  public static void Prune() {
    DateTime cutoff=DateTime.UtcNow.AddDays(-10);
    try {
      using(var temp=RetentionHandle.OpenDirectory(TraceParent()))
      using(var root=temp.OpenChild(Folder,true,false)) {
        foreach(string name in root.Names()) {
          Match match=Regex.Match(name,"^trace-([a-f0-9]{32})\\.log$");
          if(!match.Success)continue;
          try {
            // Exclusive DELETE access fails while a chooser still owns the trace.
            using(var file=root.OpenChild(name,false,true)) {
              if(file.LastWriteUtc>cutoff)continue;
              string prefix=Header+match.Groups[1].Value+"\n";
              if(file.ReadText(4096).StartsWith(prefix,StringComparison.Ordinal))file.Remove();
            }
          } catch { /* busy, inaccessible, linked or malformed: retain */ }
        }
      }
    } catch { /* no supported trace directory or no access */ }
  }

  public void Dispose() { file.Dispose(); root.Dispose(); temp.Dispose(); }
}
