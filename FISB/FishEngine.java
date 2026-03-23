import javax.swing.*;
import javafx.embed.swing.JFXPanel;
import javafx.scene.Scene;
import javafx.scene.web.WebView;
import javafx.application.Platform;
import java.io.File;

public class FishEngine extends JFrame {
    public FishEngine() {
        JFXPanel jfxPanel = new JFXPanel();
        add(jfxPanel);

        Platform.runLater(() -> {
            WebView webView = new WebView();
            File file = new File("index.html");
            webView.getEngine().load(file.toURI().toString());
            jfxPanel.setScene(new Scene(webView));
        });

        setTitle("Fish Engine | FISB v0.3.5");
        setSize(1200, 800);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new FishEngine().setVisible(true);
        });
    }
}
