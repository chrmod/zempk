package android.impakt.de.impakt;

import android.app.ActionBar;
import android.content.Intent;
import android.os.Build;
import android.support.design.widget.Snackbar;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.ImageView;
import android.widget.LinearLayout;

import net.gini.android.models.SpecificExtraction;
import net.gini.android.vision.BitmapFuture;
import net.gini.android.vision.CaptureActivity;
import net.gini.android.vision.ScannerActivity;

import org.jetbrains.annotations.NotNull;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;


public class MainActivity extends ActionBarActivity {

    protected static final int IMAGE_REQUEST = 1;
    public static final String EXTRA_DOCUMENT = "document";
    public static final String EXTRA_EXTRACTIONS = "extractions";

    private static final String TAG = "MainActivity";
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mWebView = (WebView)findViewById(R.id.webview);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && BuildConfig.DEBUG) {
            mWebView.setWebContentsDebuggingEnabled(true);
        }

        final WebSettings settings = mWebView.getSettings();
        // settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setJavaScriptEnabled(true);
        mWebView.loadUrl("http://172.20.128.217:3000");

        Toolbar toolbar = (Toolbar) findViewById(R.id.my_awesome_toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayShowTitleEnabled(false);
        toolbar.setLogo(R.drawable.makebank);

        DrawerLayout mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle mDrawerToggle = new ActionBarDrawerToggle(
                this,  mDrawerLayout, toolbar,
                R.string.navigation_drawer_open, R.string.navigation_drawer_close
        );
        mDrawerLayout.setDrawerListener(mDrawerToggle);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setHomeButtonEnabled(true);
        mDrawerToggle.syncState();

        final ImageView medalView = new ImageView(this);
        medalView.setImageResource(R.drawable.medal);
        medalView.setLayoutParams(new LinearLayout.LayoutParams(getResources().getDimensionPixelSize(R.dimen.medal_width), LinearLayout.LayoutParams.MATCH_PARENT));
        medalView.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        // medalView.setPadding(0, 0, 16, 0);

        toolbar.addView(medalView);
    }

    @NotNull
    private Map<String, SpecificExtraction> unpackExtractions(final Bundle extractionBundle) {
        Intent intent = getIntent();
        if (extractionBundle == null) {
            return null;
        }
        final Map<String, SpecificExtraction> extractionMap = new HashMap<>();
        for (String key: extractionBundle.keySet()){
            SpecificExtraction extraction = extractionBundle.getParcelable(key);
            extractionMap.put(key, extraction);
        }
        return extractionMap;
    }

    /**
     * Evaluate JS in web context
     * @param js JS command
     */
    private void executeJS(final String js) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            mWebView.evaluateJavascript(js, null);
        } else {
            mWebView.loadUrl("javascript:" + js);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Bundle documentBundle;
        BitmapFuture originalFuture = null;
        BitmapFuture rectifiedFuture = null;

        if (requestCode == IMAGE_REQUEST && data != null) {
            documentBundle = data.getBundleExtra(ScannerActivity.EXTRA_DOCUMENT_BUNDLE);
            if (documentBundle != null) {
                originalFuture = documentBundle.getParcelable(CaptureActivity.EXTRA_ORIGINAL);
                rectifiedFuture = documentBundle.getParcelable(CaptureActivity.EXTRA_DOCUMENT);
            }
        }

        if (requestCode == IMAGE_REQUEST && resultCode == RESULT_OK) {
            final String imageFilename = getImageFilename();


            final Bundle extractionsBundle = data.getBundleExtra(EXTRA_EXTRACTIONS);
            final Map<String, SpecificExtraction> extractionMap = unpackExtractions(extractionsBundle);

            if (extractionMap != null && extractionMap.containsKey("amountToPay")) {
                final SpecificExtraction ex = extractionMap.get("amountToPay");

                final String value = ex.getValue();
                final float price;

                try {
                    if (value.contains(":")) {
                        price = Float.parseFloat(value.substring(0, value.indexOf(":")));
                    } else {
                        price = Float.parseFloat(value);
                    }

                    executeJS("addCustomTransaction(" + price + ")");

                    Snackbar
                            .make(mWebView, getResources().getString(R.string.scan_you_spent_money, price), Snackbar.LENGTH_LONG)
                            .show(); // Don’t forget to show!
                    Log.d(TAG, "Price: " + ex.getValue());
                } catch (Exception e) {
                    Log.e(TAG, "Cannot parse price", e);
                }
            } else {
                Snackbar
                        .make(mWebView, R.string.scan_couldnt_find_price, Snackbar.LENGTH_LONG)
                        .show(); // Don’t forget to show!
            }
        } else if (requestCode == IMAGE_REQUEST && resultCode == ScannerActivity.RESULT_ERROR) {
            final ScannerActivity.Error error = data.getParcelableExtra(ScannerActivity.EXTRA_ERROR);
            Snackbar
                    .make(mWebView, getResources().getString(R.string.scan_error_, error.toString()), Snackbar.LENGTH_LONG)
                    .show(); // Don’t forget to show!
        } else if (requestCode == IMAGE_REQUEST && resultCode == UploadActivity.RESULT_UPLOAD_ERROR) {
            final String error = data.getStringExtra(UploadActivity.EXTRA_ERROR_STRING);
            Snackbar
                    .make(mWebView, getResources().getString(R.string.scan_error_, error.toString()), Snackbar.LENGTH_LONG)
                    .show(); // Don’t forget to show!
        }
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        if (id == R.id.action_scan) {
            scanDocument();
        }

        return super.onOptionsItemSelected(item);
    }

    private String getImageFilename() {
        return new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:s", Locale.GERMANY).format(new Date());
    }

    public void scanDocument() {
        Intent scanIntent = new Intent(this, CaptureActivity.class);
        scanIntent.putExtra(CaptureActivity.EXTRA_STORE_ORIGINAL, false);
        scanIntent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
        CaptureActivity.setUploadActivityExtra(scanIntent, this, UploadActivity.class);
        startActivityForResult(scanIntent, IMAGE_REQUEST);
    }
}
