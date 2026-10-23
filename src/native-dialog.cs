// MIT. Standalone native Windows dialogs; JSON stdin/stdout, no transcript access.
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using System.Diagnostics;
internal static class NativeDialog {
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
            Trace("show-file");if(dialog.ShowDialog(owner)==DialogResult.OK)path=dialog.FileName;Trace("file-closed");
          }
        } else if(request["mode"]=="folder") {
          using(var dialog=new FolderBrowserDialog()) {
            dialog.Description=request["title"];dialog.SelectedPath=request["initialDirectory"];
            dialog.ShowNewFolderButton=true;
            if(dialog.ShowDialog(owner)==DialogResult.OK)path=dialog.SelectedPath;
          }
        } else throw new Exception("Unsupported dialog mode");
        output.Write(serializer.Serialize(new {path=path}));return 0;
        }
      } catch(Exception error) {output.Write(serializer.Serialize(new {error=error.Message}));return 1;}
    }
  }
}
