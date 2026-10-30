// MIT. Standalone native Windows dialogs; JSON stdin/stdout, no transcript access.
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using System.Diagnostics;
using System.Runtime.InteropServices;
internal static class NativeDialog {
  [ComImport, Guid("43826D1E-E718-42EE-BC55-A1E261C37BFE"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  private interface IShellItem {
    void BindToHandler(IntPtr context,ref Guid handler,ref Guid iid,out IntPtr value);
    void GetParent(out IShellItem parent);
    void GetDisplayName(uint kind,out IntPtr name);
  }
  [ComImport, Guid("42f85136-db7e-439c-85f1-e4075d135fc8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  private interface IFileDialog {
    [PreserveSig] int Show(IntPtr owner);
    void SetFileTypes(uint count,IntPtr types);
    void SetFileTypeIndex(uint index);
    void GetFileTypeIndex(out uint index);
    void Advise(IntPtr events,out uint cookie);
    void Unadvise(uint cookie);
    void SetOptions(uint options);
    void GetOptions(out uint options);
    void SetDefaultFolder(IShellItem folder);
    void SetFolder(IShellItem folder);
    void GetFolder(out IShellItem folder);
    void GetCurrentSelection(out IShellItem selection);
    void SetFileName([MarshalAs(UnmanagedType.LPWStr)]string name);
    void GetFileName(out IntPtr name);
    void SetTitle([MarshalAs(UnmanagedType.LPWStr)]string title);
    void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)]string text);
    void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)]string text);
    void GetResult(out IShellItem result);
  }
  [DllImport("shell32.dll",CharSet=CharSet.Unicode,PreserveSig=false)]
  private static extern void SHCreateItemFromParsingName(string path,IntPtr context,ref Guid iid,out IShellItem item);
  private static string ChooseFolder(Form owner,string title,string directory) {
    IFileDialog dialog=null;IShellItem initial=null,result=null;
    try {
      dialog=(IFileDialog)Activator.CreateInstance(Type.GetTypeFromCLSID(new Guid("DC1C5A9C-E88A-4DDE-A5A1-60F82A20AEF7")));
      uint options;dialog.GetOptions(out options);
      // Standard Shell folder picker: real filesystem, address bar, existing path.
      dialog.SetOptions(options|0x20u|0x40u|0x800u|0x8u|0x02000000u);
      dialog.SetTitle(title);dialog.SetOkButtonLabel("选择此文件夹");
      Guid iid=typeof(IShellItem).GUID;SHCreateItemFromParsingName(directory,IntPtr.Zero,ref iid,out initial);dialog.SetFolder(initial);
      int hr=dialog.Show(owner.Handle);if(hr==unchecked((int)0x800704c7))return null;Marshal.ThrowExceptionForHR(hr);
      dialog.GetResult(out result);IntPtr text;result.GetDisplayName(0x80058000u,out text);
      try{return Marshal.PtrToStringUni(text);}finally{Marshal.FreeCoTaskMem(text);}
    } finally {
      if(result!=null)Marshal.ReleaseComObject(result);
      if(initial!=null&&!Object.ReferenceEquals(initial,result))Marshal.ReleaseComObject(initial);
      if(dialog!=null)Marshal.ReleaseComObject(dialog);
    }
  }
  private static void Trace(string phase){if(Environment.GetEnvironmentVariable("DSH_EXPORTER_NATIVE_DEBUG")=="1")File.AppendAllText(Path.Combine(Path.GetTempPath(),"dsh-native-"+Process.GetCurrentProcess().Id+".log"),phase+"\n");}
  [STAThread]
  private static int Main() {
    Trace("start");
    var serializer = new JavaScriptSerializer();
    using (var output = new StreamWriter(Console.OpenStandardOutput(), new UTF8Encoding(false))) {
      Trace("stdout-ready");
      try {
        string input;
        using (var reader = new StreamReader(Console.OpenStandardInput(), Encoding.UTF8)) input=reader.ReadLine();
        Trace("input-read");
        if(input==null)throw new Exception("Missing dialog request");
        if (input.Length>65536) throw new Exception("Dialog request too long");
        var request=serializer.Deserialize<Dictionary<string,string>>(input);
        Trace("parsed");
        Application.EnableVisualStyles();
        using(var owner=new Form()) {
        owner.Text="DSH AI Exporter";owner.Width=460;owner.Height=140;
        owner.StartPosition=FormStartPosition.CenterScreen;owner.ShowInTaskbar=true;
        var label=new Label();label.Text=request["title"];label.Dock=DockStyle.Fill;label.TextAlign=System.Drawing.ContentAlignment.MiddleCenter;owner.Controls.Add(label);
        owner.Show();owner.Activate();Application.DoEvents();
        string path=null;
        if (request["mode"]=="file") {
          using (var dialog=new SaveFileDialog()) {
            dialog.Title=request["title"];dialog.InitialDirectory=request["initialDirectory"];
            dialog.FileName=request["fileName"];dialog.Filter=request["filter"];
            dialog.DefaultExt=request["extension"];dialog.AddExtension=true;
            dialog.CheckPathExists=true;dialog.ValidateNames=true;dialog.OverwritePrompt=false;
            dialog.AutoUpgradeEnabled=true;dialog.RestoreDirectory=true;
            Trace("show-file");if(dialog.ShowDialog(owner)==DialogResult.OK)path=dialog.FileName;Trace("file-closed");
          }
        } else if(request["mode"]=="folder") {
          path=ChooseFolder(owner,request["title"],request["initialDirectory"]);
        } else throw new Exception("Unsupported dialog mode");
        output.Write(serializer.Serialize(new {path=path}));return 0;
        }
      } catch(Exception error) {output.Write(serializer.Serialize(new {error=error.Message}));return 1;}
    }
  }
}
