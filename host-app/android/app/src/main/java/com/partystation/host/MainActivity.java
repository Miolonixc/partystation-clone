package com.partystation.host;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String PREFS = "partystation";
    private static final String KEY_URL = "server_url";
    private static final String DEFAULT_URL = "http://192.168.2.107:5173";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        String savedUrl = getPrefs().getString(KEY_URL, null);
        if (savedUrl != null) {
            webView.loadUrl(savedUrl);
        } else {
            showUrlDialog();
        }
    }

    private SharedPreferences getPrefs() {
        return getSharedPreferences(PREFS, MODE_PRIVATE);
    }

    private void showUrlDialog() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * getResources().getDisplayMetrics().density);
        layout.setPadding(pad, pad, pad, pad);

        TextView label = new TextView(this);
        label.setText("Адрес сервера:");
        label.setTextSize(16);
        layout.addView(label);

        final EditText input = new EditText(this);
        input.setHint("http://IP:5173");
        input.setText(DEFAULT_URL);
        input.setTextSize(16);
        layout.addView(input);

        new AlertDialog.Builder(this)
            .setTitle("PartyStation")
            .setMessage("Введите адрес сервера для подключения")
            .setView(layout)
            .setCancelable(false)
            .setPositiveButton("Подключить", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    String url = input.getText().toString().trim();
                    if (!url.isEmpty()) {
                        if (!url.startsWith("http")) {
                            url = "http://" + url;
                        }
                        getPrefs().edit().putString(KEY_URL, url).apply();
                        webView.loadUrl(url);
                    }
                }
            })
            .setNeutralButton("Сменить сервер", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    getPrefs().edit().remove(KEY_URL).apply();
                    showUrlDialog();
                }
            })
            .show();
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            new AlertDialog.Builder(this)
                .setTitle("Выход")
                .setMessage("Выйти из PartyStation?")
                .setPositiveButton("Да", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        finish();
                    }
                })
                .setNegativeButton("Нет", null)
                .show();
        }
    }
}
